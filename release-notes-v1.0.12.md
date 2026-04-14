# v1.0.12 - Bug Fixes and Stability Improvements

## 🐛 Bug Fixes

- **Scan validation consistency**: Added same validation logic to One-Click Scan as manual paste to prevent invalid data entry
- **Dashboard null safety**: Added optional chaining to prevent crashes from undefined productApplicationIdentifier
- **Error Boundary**: Added React Error Boundary to prevent white-screen crashes
- **getProductInfo truthy bug**: Fixed empty array truthy check that caused incorrect product type detection
- **getTimeAgo negative time**: Fixed negative time display for future timestamps

## 📁 Code Organization

- **Shared utilities**: Extracted `formatDate`, `getTimeAgo`, `compareVersions`, `isValidChaseData` to `utils.ts`
- **Test reliability**: Updated tests to import from shared utils instead of copying function bodies

## 📝 Known Issues

- None at this time. All critical bugs from previous versions have been resolved.