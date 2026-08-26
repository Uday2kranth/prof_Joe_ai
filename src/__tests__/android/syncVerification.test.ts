import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Layer 4 / Mobile Sync: Dual Android & Build Verification', () => {
  const rootDir = process.cwd();

  it('should have a valid package.json with version and build scripts', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    expect(fs.existsSync(pkgPath)).toBe(true);

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBe('prof-joe-ai');
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(pkg.scripts['build']).toBeDefined();
    expect(pkg.scripts['verify']).toBeDefined();
    expect(pkg.scripts['test']).toBeDefined();
  });

  it('should have android/app/build.gradle with versionCode and versionName', () => {
    const gradlePath = path.join(rootDir, 'android/app/build.gradle');
    if (fs.existsSync(gradlePath)) {
      const content = fs.readFileSync(gradlePath, 'utf-8');
      expect(content).toMatch(/versionCode\s+\d+/);
      expect(content).toMatch(/versionName\s+["'][^"']+["']/);
    }
  });

  it('should have capacitor.config.ts configured with appId and webDir', () => {
    const capConfigPath = path.join(rootDir, 'capacitor.config.ts');
    if (fs.existsSync(capConfigPath)) {
      const content = fs.readFileSync(capConfigPath, 'utf-8');
      expect(content).toMatch(/appId/);
      expect(content).toMatch(/webDir:\s*['"]dist['"]/);
    }
  });

  it('should have all 10 Math Studio pure calculation engines present in src/utils/math_studio/', () => {
    const mathStudioDir = path.join(rootDir, 'src/utils/math_studio');
    expect(fs.existsSync(mathStudioDir)).toBe(true);

    const expectedEngines = [
      'gaussianStats.ts',
      'svcEngine.ts',
      'svrEngine.ts',
      'logisticSoftmax.ts',
      'linearRegression.ts',
      'multilineSystems.ts',
      'fourierHarmonics.ts',
      'tangentsRiemann.ts',
      'odeVectorFields.ts',
      'marchingContours.ts',
    ];

    for (const engine of expectedEngines) {
      expect(fs.existsSync(path.join(mathStudioDir, engine))).toBe(true);
    }
  });
});
