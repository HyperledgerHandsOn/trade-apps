/*
SPDX-License-Identifier: Apache-2.0
*/
/*
    ACKNOWLEDGMENT: https://dzone.com/articles/spring-boot-security-json-web-tokenjwt-hello-world
*/

package org.trade.exportingentity;

import java.io.Serializable;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class SecurityUtils implements Serializable {
	private static final long serialVersionUID = 7528105115616099484L;
	public static final long JWT_TOKEN_VALIDITY = 15 * 60 * 60;

	@Value("${jwt.secret}")
	private String secret;
	protected static final String registrarRole = "REGISTRAR";
	protected static final String adminRole = "ADMIN";
	protected static final String clientRole = "CLIENT";

	protected static boolean recognizedRole(String role) {
		role = role.toUpperCase();
		return (role.equals(adminRole) || role.equals(clientRole));
	}

	protected static boolean isRegistrar(Authentication authResult) {
		Collection<? extends GrantedAuthority> auths = authResult.getAuthorities();
		for (GrantedAuthority auth: auths) {
			if (auth.getAuthority().equals("ROLE_" + registrarRole)) {
					return true;
			}
		}
		return false;
	}

	protected static boolean isExportingEntity(Authentication authResult) {
		Collection<? extends GrantedAuthority> auths = authResult.getAuthorities();
		for (GrantedAuthority auth: auths) {
			if (auth.getAuthority().equals("ROLE_" + clientRole)) {
					return true;
			}
		}
		return false;
	}

	public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = getAllClaimsFromToken(token);
		return claimsResolver.apply(claims);
	}
		
	private Claims getAllClaimsFromToken(String token) {
		return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
	}	
	
	public Date getExpirationDateFromToken(String token) {
		return getClaimFromToken(token, Claims::getExpiration);
	}

	public String getUsernameFromToken(String token) {
		return getClaimFromToken(token, Claims::getSubject);
	}

	private Boolean isTokenExpired(String token) {
		final Date expiration = getExpirationDateFromToken(token);
		return expiration.before(new Date());
	}
	
	public String generateToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		return doGenerateToken(claims, userDetails.getUsername());
	}
	
	private String doGenerateToken(Map<String, Object> claims, String subject) {
		return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis()))
			.setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000))
			.signWith(SignatureAlgorithm.HS512, secret).compact();
		}
		
	public Boolean validateToken(String token, UserDetails userDetails) {
		final String username = getUsernameFromToken(token);
		return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
	}

	protected String getUserNameFromTokenHeaders(Map<String, String> requestHeaders) {
		String requestTokenHeader = requestHeaders.get("Authorization");
		if (requestTokenHeader == null) {
			requestTokenHeader = requestHeaders.get("authorization");
		}
		String username = null;
		String jwtToken = null;

		// JWT Token is in the form "Bearer token". Remove Bearer word and get only the Token
		if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
			jwtToken = requestTokenHeader.substring(7);
			try {
				username = getUsernameFromToken(jwtToken);
				return username;
			} catch (IllegalArgumentException e) {
				System.out.println("Unable to get JWT Token");
			} catch (ExpiredJwtException e) {
				System.out.println("JWT Token has expired");
			}
		} else {
			System.out.println("JWT Token does not begin with Bearer String");
		}
		return null;
	}
		
}
