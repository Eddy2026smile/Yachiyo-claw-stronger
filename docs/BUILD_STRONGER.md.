# Build stronger-v0.0.27

From the stronger-v0.0.27 branch:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-toolchain.ps1
powershell -ExecutionPolicy Bypass -File scripts/yachiyo-env.ps1 pnpm install
powershell -ExecutionPolicy Bypass -File scripts/yachiyo-env.ps1 pnpm run mobile:sync:android
powershell -ExecutionPolicy Bypass -File scripts/yachiyo-env.ps1 gradle assembleDebug
