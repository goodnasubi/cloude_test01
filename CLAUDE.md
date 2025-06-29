# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository currently contains documentation for an AWS Amplify Gen2 authentication system implementation. The main content is in `claude_ans_01.md`, which describes a URL path parameter-based automatic authentication system using AWS Amplify Gen2, Next.js, and multiple authentication providers (Cognito and SAML).

## Current Structure

- `claude_ans_01.md` - Technical documentation in Japanese describing:
  - AWS Amplify Gen2 backend configuration
  - Next.js frontend implementation with dynamic authentication routing
  - Service-based authentication management with database integration
  - URL path parameter authentication flow

## Development Context

Since this repository only contains documentation and no actual code, any development work would likely involve:

1. **Creating the actual implementation** based on the documented architecture
2. **Setting up AWS Amplify Gen2 project structure** with proper backend and auth configurations
3. **Implementing the Next.js frontend** with the described authentication flow
4. **Database schema setup** for service and user management

## Architecture Notes

The documented system follows a service-oriented authentication pattern where:
- Each service has its own URL path (e.g., `/app1`, `/app2`)
- Authentication method is determined by service configuration stored in database
- Supports both AWS Cognito and SAML authentication providers
- Includes automatic redirect handling and user session management