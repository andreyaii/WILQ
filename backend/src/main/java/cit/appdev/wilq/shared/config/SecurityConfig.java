package cit.appdev.wilq.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import cit.appdev.wilq.shared.security.AccountDetailsService;
import cit.appdev.wilq.shared.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())

                                .authorizeHttpRequests(auth -> auth
                                                // PUBLIC: Anyone can access these
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/api/public/**").permitAll()

                                                // PROTECTED: Only specific roles can access
                                                .requestMatchers("/api/admin/**").hasRole("Admin")

                                                // PROTECTED: Any authenticated user can access
                                                .requestMatchers("/api/users/**").authenticated()

                                                // DEFAULT: Block everything else
                                                .anyRequest().authenticated())

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .authenticationProvider(authenticationProvider)

                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public AuthenticationProvider authenticationProvider(AccountDetailsService uds,
                        PasswordEncoder encoder) {
                var provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(uds);
                provider.setPasswordEncoder(encoder);
                return provider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationProvider p) {
                return new ProviderManager(p);
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
