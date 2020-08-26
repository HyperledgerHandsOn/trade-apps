/*
SPDX-License-Identifier: Apache-2.0
*/
package org.trade.importer;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.PrivateKey;
import java.security.cert.CertificateException;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

import org.hyperledger.fabric.gateway.Identities;
import org.hyperledger.fabric.gateway.Identity;
import org.hyperledger.fabric.gateway.X509Identity;
import org.hyperledger.fabric.gateway.Wallet;
import org.hyperledger.fabric.gateway.Wallets;
import org.hyperledger.fabric.sdk.Enrollment;
import org.hyperledger.fabric.sdk.NetworkConfig;
import org.hyperledger.fabric.sdk.exception.NetworkConfigurationException;
import org.hyperledger.fabric_ca.sdk.Attribute;
import org.hyperledger.fabric_ca.sdk.HFCAClient;
import org.hyperledger.fabric_ca.sdk.RegistrationRequest;
import org.hyperledger.fabric_ca.sdk.exception.EnrollmentException;
import org.hyperledger.fabric_ca.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.User;
import org.hyperledger.fabric.sdk.NetworkConfig.OrgInfo;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;

/**
 * Utility functions to connect to a Fabric networks CAs, register and enroll
 * users, and save identities to wallets
 */
public class FabricIdentityUtils {

    public static String walletsBaseDir = "";

    private static String adminUser = "admin";
    private static String adminPassword = "adminpw";

    public final static String BUSINESS_ROLE_ATTR = "BUSINESS_ROLE";
    public final static String IMPORTER_BANKER_ROLE = "importer_banker";
    public final static String IMPORTER_ROLE = "importer";
    public static HashMap<String, String> contractRoles = new HashMap<String, String>();

    static {
        contractRoles.put(SecurityUtils.bankerRole, IMPORTER_BANKER_ROLE);
        contractRoles.put(SecurityUtils.clientRole, IMPORTER_ROLE);
    }

    private static String readFile(String filePath) {
        try {
            StringBuffer file = new StringBuffer();
            FileReader fr = new FileReader(filePath);
            BufferedReader br = new BufferedReader(fr);
            while (true) {
                String line = br.readLine();
                if (line == null) {
                    break;
                }
                if (file.length() > 0) {
                    file.append("\n");
                }
                file.append(line.trim());
            }
            br.close();
            fr.close();
            return file.toString();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private JsonObject fileToJsonObject(String filePath) {
        String connProfile = readFile(filePath);
        JsonReader jsonReader = Json.createReader(new StringReader(connProfile));
        JsonObject connProfileObj = jsonReader.readObject();
        jsonReader.close();
        return connProfileObj;
    }

    private static HFCAClient getCAClientForOrg(String orgMspId) {
        NetworkConfig orgNetworkConfig;
        try {
            orgNetworkConfig = NetworkConfig.fromJsonFile(Paths.get(FabricNetworkUtils.connectionProfilesBaseDir, FabricNetworkUtils.connectionProfileJson).toFile());
        } catch (NetworkConfigurationException | IOException e) {
            e.printStackTrace();
            return null;
        }
        OrgInfo orgInfo = orgNetworkConfig.getOrganizationInfo(orgMspId);
        if (orgInfo == null) {
            System.out.println("No info found for org " + orgMspId + " in connection profile");
            return null;
        }
        List<NetworkConfig.CAInfo> orgCAList = orgInfo.getCertificateAuthorities();
        if (orgCAList.size() == 0) {
            System.out.println("No CA found in connection profile for org " + orgMspId);
            return null;
        }
        NetworkConfig.CAInfo orgCAInfo = orgCAList.get(0); // Get the first CA in the list
        HFCAClient caClient;
        try {
            caClient = HFCAClient.createNewInstance(orgCAInfo);
        } catch (org.hyperledger.fabric_ca.sdk.exception.InvalidArgumentException | MalformedURLException e) {
            e.printStackTrace();
            return null;
        }
        return caClient;
    }

    public static boolean enrollRegistrar(String orgMspId) {
        // Try to load the registrar
        Wallet orgWallet;
        try {
            orgWallet = Wallets.newFileSystemWallet(Paths.get(walletsBaseDir, orgMspId));
            Identity adminIdentity = orgWallet.get(adminUser);
            if (adminIdentity != null) {
                System.out.println("Successfully loaded admin user 'admin' of org  " + orgMspId + " from wallet");
                return true;
            }
        } catch (IOException ioe) {
            ioe.printStackTrace();
            return false;
        }

        HFCAClient caClient = getCAClientForOrg(orgMspId);
        if (caClient == null) {
            return false;
        }
        Enrollment enrollment;
        try {
            enrollment = caClient.enroll(adminUser, adminPassword);   // This is always hardcoded
            if (enrollment == null) {
                return false;
            }
        } catch (EnrollmentException | InvalidArgumentException e) {
            e.printStackTrace();
            return false;
        }
        System.out.println("Successfully enrolled admin user 'admin' of org  " + orgMspId);
        System.out.println("Enrolled registrar cert: " + enrollment.getCert());
        System.out.println("Enrolled registrar private key: " + Identities.toPemString(enrollment.getKey()));

        try {
            orgWallet.put(adminUser, Identities.newX509Identity(orgMspId, enrollment));
        } catch (IOException | NullPointerException | CertificateException e) {
            e.printStackTrace();
            return false;
        }
        System.out.println("Successfully imported admin user 'admin' of org  " + orgMspId + " into wallet");
        return true;
    }

    // Register and enroll a user through a registrar
    public static boolean registerAndEnrollUser(String orgMspId, String userId, String role) {
        Identity adminIdentity;
        try {
            Wallet orgWallet = Wallets.newFileSystemWallet(Paths.get(walletsBaseDir, orgMspId));

            // Is user already enrolled?
            Identity userIdentity = orgWallet.get(userId);
            if (userIdentity != null) {
                System.out.println("User " + userId + " already present in wallet for org " + orgMspId);
                return true;
            }

            // Try to load the registrar
            adminIdentity = orgWallet.get(adminUser);
            if (adminIdentity == null) {
                throw new NullPointerException("No admin identity found in wallet for org " + orgMspId + ". Run enrollRegistrar(...) first.");
            }
            System.out.println("Successfully loaded admin user 'admin' of org  " + orgMspId + " from wallet");
        } catch (IOException | NullPointerException e) {
            e.printStackTrace();
            return false;
        }

        // Connect to the network (org CA)
        HFCAClient caClient = getCAClientForOrg(orgMspId);
        if (caClient == null) {
            return false;
        }
        Enrollment enrollment;
        try {
            User admin = new User() {

                @Override
                public String getName() {
                    return adminUser;
                }
    
                @Override
                public Set<String> getRoles() {
                    return null;
                }
    
                @Override
                public String getAccount() {
                    return null;
                }
    
                @Override
                public String getAffiliation() {
                    return "org1.department1";
                }
    
                @Override
                public Enrollment getEnrollment() {
                    return new Enrollment() {
    
                        @Override
                        public PrivateKey getKey() {
                            return ((X509Identity) adminIdentity).getPrivateKey();
                        }
    
                        @Override
                        public String getCert() {
                            return Identities.toPemString(((X509Identity) adminIdentity).getCertificate());
                        }
                    };
                }
    
                @Override
                public String getMspId() {
                    return orgMspId;
                }
    
            };
            RegistrationRequest regReq = new RegistrationRequest(userId);

            if (role.toUpperCase().equals(SecurityUtils.adminRole)) {
                regReq.setType("admin");    // Have to hardcode this as this seems to be a hidden option
            } else {
                regReq.setType(HFCAClient.HFCA_TYPE_CLIENT);    // If it's not an admin, it's a client
                // Client here can be a banker or a trader who is a bank client; this will be embedded as a role attribute in the certificate
                String appRole = role.toUpperCase();
                if (!contractRoles.containsKey(appRole)) {
                    throw new NullPointerException("Role " + appRole + " does not map to any Fabric contract role");
                }
                regReq.addAttribute(new Attribute(BUSINESS_ROLE_ATTR, contractRoles.get(appRole), true));
            }

            String enrollmentSecret = caClient.register(regReq, admin);
            if (enrollmentSecret == null) {
                throw new NullPointerException("Registration failed");
            }
            enrollment = caClient.enroll(userId, enrollmentSecret);
            if (enrollment == null) {
                throw new NullPointerException("Enrollment failed");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        System.out.println("Successfully enrolled user '" + userId + "' of org  " + orgMspId);
        System.out.println("Enrolled user cert: " + enrollment.getCert());
        System.out.println("Enrolled user private key: " + Identities.toPemString(enrollment.getKey()));

        try {
            Wallet orgWallet = Wallets.newFileSystemWallet(Paths.get(walletsBaseDir, orgMspId));
            orgWallet.put(userId, Identities.newX509Identity(orgMspId, enrollment));
        } catch (IOException | NullPointerException | CertificateException e) {
            e.printStackTrace();
            return false;
        }
        System.out.println("Successfully imported user '" + userId + "' of org  " + orgMspId + " into wallet");
        return true;
    }

    // This function can be used to load cert/key created using cryptogen and save it in the wallet: 'userId' can be 'admin' or some other user
    public static boolean loadUserIntoWallet(String orgMspId, String userId, String certPath, String keyPath) {
        String cert = readFile(certPath);
        if (cert == null) {
            return false;
        }
        String key = readFile(keyPath);
        if (key == null) {
            return false;
        }
        try {
            Wallet orgWallet = Wallets.newFileSystemWallet(Paths.get(walletsBaseDir, orgMspId));
            Identity adminIdentity = Identities.newX509Identity(orgMspId, Identities.readX509Certificate(cert), Identities.readPrivateKey(key));
            orgWallet.put(userId, adminIdentity);
        } catch (IOException | NullPointerException | CertificateException | InvalidKeyException e) {
            e.printStackTrace();
            return false;
        }
        System.out.println("Successfully loaded admin user 'admin' of org  " + orgMspId + " into wallet");
        return true;
    }

    // Load user credentials from wallet
    public static Identity loadUserFromWallet(String orgMspId, String userId) {
        Identity identity;
        try {
            Wallet orgWallet = Wallets.newFileSystemWallet(Paths.get(walletsBaseDir, orgMspId));
            identity = orgWallet.get(userId);
            if (identity == null) {
                System.out.println("User " + userId + " not found in wallet for org " + orgMspId);
                return null;
            }
        } catch (IOException | NullPointerException e) {
            e.printStackTrace();
            return null;
        }
        System.out.println("Successfully loaded admin user 'admin' of org  " + orgMspId + " from wallet");
        return identity;
    }

}
