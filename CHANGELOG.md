# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Fixed

Add a `z-index` to the suggested "simple" installation

## [Unreleased]

### Changed

- **Changed:** `initIAdvizeHost(sandboxId)` `targetOrigin` argument is now optional (defaults to `*`).
- **Changed:** `initIAdvizeIframe` now accepts a 4th optional argument `targetOrigin` (defaults to `*`) for enhanced security. The signature remains backward compatible: `initIAdvizeIframe(websiteId, platform, context, targetOrigin)`.
- **Changed:** `getActivateAuthToken` now accepts an optional `targetOrigin` argument (defaults to `*`).
- All `postMessage` calls now use the specific `targetOrigin` (or `*` if not provided) for enhanced security.

### Security

- Enforced strict origin checks on all incoming and outgoing messages to prevent Cross-Site Scripting (XSS) and data leakage.

### Fixed

-   Fixed potential data leakage of JWE tokens by ensuring they are only sent to the trusted iframe origin.

## [1.4.3]

### Fixed

Update the documentation with a simplified installation

## [1.4.2]

### Fixed

-   Fix sanboxed iframe allow attributes

## [1.4.1]

### Fixed

-   Fix resizeIframe left position condition, the 0 value could not be set.

## [1.4.0]

### Changed

-   Update documentation: iframe sandbox params

## [1.3.1]

### Changed

-   Fix uploading after a release

## [1.3.0]

### Changed

-   Upload bundle assets to S3 

## [1.2.0]

### Changed

-   Update documentation "communication" section. 

## [1.1.0]

### Changed

-   Add a Web bundle for <script> consumers 

## [1.0.1]

### Fixed

-   Fix CI

## [1.0.0]

### Changed

-   Published v1.0.0

## [0.4.2]

### Fixed

-   Fix ci readme
-   Fix ci changelog

## [0.4.1]

### Fixed

-   Fix ci changelog

## [0.4.0]

### Changed

-   Rename project and variables from "Sandboxed" to "Boxed"

## [0.3.0]

### Changed

-   Add activate token refresh

## [0.2.3]

### Fixed

-   Refact iAdvizeInternals function name

## [0.2.2]

### Fixed

-   Fix web sdk get return

## [0.2.1]

### Fixed

-   Fix web sdk implementation

## [0.2.0]

### Changed

-   Update documentation

## [0.1.1]

### Fixed

-   Fix ci

## [0.1.0]

### Changed

-   Update documentation, add example
