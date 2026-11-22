# Testing and Type Checking Guidelines

## 1. Running Tests

To run all tests:
```bash
pnpm test
```

To run specific test suites:
```bash
# Android foundation tests
pnpm test:android-foundation

# UI component tests
pnpm test:ui

# Integration tests
pnpm test:integration
```

## 2. Type Checking

To check for TypeScript errors:
```bash
pnpm check
```

Common type errors to watch for:
- Missing type definitions
- Incorrect prop types
- Type mismatches in API responses
- Missing null checks

## 3. Fixing Common Issues

### Test Failures
- Update mocks to match current API responses
- Fix assertions for changed component behavior
- Add missing test cases for new features

### Type Errors
- Add missing type definitions
- Fix incorrect prop types
- Add null checks for optional values
- Update types for API responses

## 4. Best Practices
- Write tests for new features  
- Add type definitions for new components  
- Keep tests up-to-date with code changes  
- Verify fixes by re-running tests  

## 5. Liquid-Glass UI Elements  
- Polish transitions and animations  
- Verify glass morphism effects work on all platforms  
- Test adaptive density controls  
- Check contrast ratios for readability  

## 6. Local-Model Fallback  
- Implement graceful degradation when cloud models fail  
- Add clear messaging about local model limitations  
- Verify local model performance metrics  
- Document fallback behavior in BUILD_STRONGER.md  

## 7. Live2D & Agent Verification  
- Test Live2D model loading and rendering  
- Verify agent loop stability  
- Check memory usage during long sessions  
- Document known issues and workarounds  

## 8. Build Workflows  
- Configure Android debug/release builds  
- Set up desktop build pipelines  
- Document build requirements in BUILD_STRONGER.md  
- Verify cross-platform consistency  

## 9. Final Checks  
- Run `pnpm check` for type errors  
- Run `pnpm test` for test coverage  
- Commit changes with descriptive messages  
- Verify all changes against original directives  
