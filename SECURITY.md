# Security Features

OffTake implements multiple layers of security to protect user data and ensure secure communication.

## Encryption & HTTPS

✅ **Automatic HTTPS/SSL**
- All traffic is encrypted via TLS/SSL
- Automatic certificate provisioning (Vercel, Railway, etc.)
- HTTP to HTTPS redirects enforced
- HSTS (HTTP Strict Transport Security) headers enabled

## Authentication Security

✅ **Secure Password Storage**
- Passwords hashed with bcrypt (12 rounds in production)
- Never stored in plain text
- Strong password requirements (minimum 8 characters)

✅ **Session Management**
- JWT-based sessions
- Secure, HTTP-only cookies in production
- SameSite cookie protection
- 30-day session expiration
- Automatic session invalidation on logout

✅ **Rate Limiting**
- API endpoint rate limiting
- Prevents brute force attacks
- 100 requests per minute per IP

## Data Protection

✅ **Privacy-First Design**
- All listings anonymous by default
- Company names hidden until mutual opt-in
- Sensitive information protected
- No data leakage between parties

✅ **SQL Injection Protection**
- Prisma ORM with parameterized queries
- Type-safe database access
- Input validation with Zod schemas

✅ **XSS Protection**
- Content Security Policy headers
- X-XSS-Protection headers
- Input sanitization
- React's built-in XSS protection

## Security Headers

The application sets the following security headers:

- **Strict-Transport-Security**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **Content-Security-Policy**: Controls resource loading

## API Security

✅ **Authentication Required**
- Protected API routes require authentication
- Role-based access control (Manufacturer/Supplier)
- Session validation on every request

✅ **Input Validation**
- All inputs validated with Zod schemas
- Type checking
- Sanitization of user inputs

✅ **Error Handling**
- Generic error messages (no sensitive info leakage)
- Proper error logging
- No stack traces in production

## Database Security

✅ **Connection Security**
- Encrypted database connections (SSL/TLS)
- Connection pooling for performance
- Parameterized queries only
- No raw SQL execution

✅ **Access Control**
- Database credentials in environment variables
- Never committed to version control
- Separate credentials for dev/prod

## Environment Security

✅ **Secrets Management**
- All secrets in environment variables
- Never hardcoded in source code
- `.env` files in `.gitignore`
- Platform-level secret management (Vercel, etc.)

✅ **Production vs Development**
- Different security settings for production
- Secure cookies only in production
- Enhanced password hashing in production
- Stricter CORS in production

## Best Practices

1. **Regular Updates**: Keep dependencies updated
   ```bash
   npm audit fix
   ```

2. **Strong Secrets**: Use cryptographically secure random strings
   ```bash
   openssl rand -base64 32
   ```

3. **Monitor Logs**: Regularly check application logs for suspicious activity

4. **Backup Database**: Regular backups of production data

5. **Access Control**: Limit who has access to production environment

6. **2FA**: Enable two-factor authentication on hosting platform

## Compliance Considerations

The platform is designed with privacy in mind:
- Anonymous listings protect business relationships
- Mutual opt-in ensures consent
- Secure data transmission
- No unnecessary data collection

## Reporting Security Issues

If you discover a security vulnerability, please:
1. Do not create a public GitHub issue
2. Contact the maintainers privately
3. Allow time for the issue to be addressed before disclosure

## Security Updates

- Security headers are automatically applied
- Dependencies are regularly audited
- Platform security features are leveraged (Vercel, etc.)
- Database security best practices followed
