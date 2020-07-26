/*
SPDX-License-Identifier: Apache-2.0
*/
package org.trade.regulator;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeoutException;

import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.gateway.Wallet;
import org.hyperledger.fabric.gateway.Wallets;
import org.json.JSONObject;

/**
 * Utility functions to connect to a live Fabric trade network and invoke transactions on contracts
 */
public class FabricNetworkUtils {

    public static String regulatorOrgMsp = "RegulatorOrgMSP";

    public static String tradeChannel = "tradechannel";
    public static String shippingChannel = "shippingchannel";

    public static String tradeContractId = "trade";
    public static String elContractId = "exportLicense";

    public static String connectionProfilesBaseDir = "";
    public static String connectionProfileJson = "";

    public static Network getNetworkForOrgAndChannel(String connectionProfile, String walletDir, String userId, String channelName) {
        try {
            // Initialize connection profile
            Gateway.Builder builder = Gateway.createBuilder();
            Path connectionProfilePath = Paths.get(connectionProfilesBaseDir, connectionProfile);

            // Initialize wallet
            Path walletPath = Paths.get(FabricIdentityUtils.walletsBaseDir, walletDir);
            Wallet wallet = Wallets.newFileSystemWallet(walletPath);
            builder = builder.identity(wallet, userId).networkConfig(connectionProfilePath).discovery(true);

            // Connect to gateway
            Gateway gateway = builder.connect();
            Network network = gateway.getNetwork(channelName);

            return network;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String invokeContract(String userId, String channelName, String contractId, boolean isQuery, String func, String ...args) {
        JSONObject retval = new JSONObject();
        if (!(channelName.equals(tradeChannel) || channelName.equals(shippingChannel))) {
            retval.put("result", false);
            retval.put("error", "Unknown channel: " + channelName);
            return retval.toString();
        }
        Network network = getNetworkForOrgAndChannel(connectionProfileJson, regulatorOrgMsp, userId, channelName);
 
        // Invoke the contract
        Contract contract = network.getContract(contractId);
        byte[] response = new String().getBytes();
        try {
            if (isQuery) {      // QUERY (Single peer)
                response = contract.evaluateTransaction(func, args);
            } else {            // INVOKE (Multiple peers and orderer)
                response = contract.submitTransaction(func, args);
            }
            System.out.println("Result of contract function " + func + "<" + args + ">: " + new String(response));
            retval.put("result", true);
            retval.put("payload", new String(response));
        } catch(ContractException | InterruptedException | TimeoutException e) {
            System.out.println("Failed to submit contract " + e.getMessage());
            retval.put("result", false);
            retval.put("error", e.getMessage());
        }
        return retval.toString();
    }
}
