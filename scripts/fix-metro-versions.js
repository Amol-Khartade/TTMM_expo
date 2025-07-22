/**
 * This script fixes Metro package versions to ensure compatibility with Expo SDK
 * Windows-compatible version
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running Metro version fix script...');

// Force install the correct Metro versions
try {
  console.log('Installing correct Metro versions...');
  execSync('npm install metro@0.82.0 metro-config@0.82.0 metro-resolver@0.82.0 --save --force', {
    stdio: 'inherit'
  });
  console.log('Metro packages installed successfully.');
} catch (error) {
  console.error('Error installing Metro packages:', error);
}

// Create symlinks to ensure the correct versions are used
try {
  const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');
  
  // List of packages that might need to be linked
  const metroPackages = [
    'metro',
    'metro-config',
    'metro-resolver',
    'metro-runtime',
    'metro-source-map',
    'metro-transform-worker'
  ];
  
  // Windows-compatible function to find nested packages
  function findNestedPackages(basePath, packageName, targetPath) {
    const results = [];
    
    function searchDir(currentPath) {
      try {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const fullPath = path.join(currentPath, entry.name);
            
            // Skip the target path
            if (fullPath === targetPath) continue;
            
            // Check if this is a node_modules directory
            if (entry.name === 'node_modules') {
              // Check if the package exists in this node_modules directory
              const packagePath = path.join(fullPath, packageName);
              if (fs.existsSync(packagePath)) {
                results.push(packagePath);
              }
            }
            
            // Continue searching recursively
            searchDir(fullPath);
          }
        }
      } catch (err) {
        // Ignore permission errors and continue
      }
    }
    
    searchDir(basePath);
    return results;
  }
  
  // Create symlinks for each package
  metroPackages.forEach(pkg => {
    const targetPath = path.join(nodeModulesPath, pkg);
    
    // Check if the package exists at the root level
    if (fs.existsSync(targetPath)) {
      console.log(`Creating symlinks for ${pkg}...`);
      
      // Find all instances of the package in node_modules
      try {
        const nestedPaths = findNestedPackages(nodeModulesPath, pkg, targetPath);
        
        nestedPaths.forEach(nestedPath => {
          if (nestedPath && nestedPath !== targetPath) {
            try {
              // Remove the nested package
              fs.rmSync(nestedPath, { recursive: true, force: true });
              
              // Create a symlink to the root package
              fs.symlinkSync(targetPath, nestedPath, 'junction');
              console.log(`Created symlink: ${nestedPath} -> ${targetPath}`);
            } catch (err) {
              console.error(`Error creating symlink for ${nestedPath}:`, err);
            }
          }
        });
      } catch (err) {
        console.error(`Error finding nested packages for ${pkg}:`, err);
      }
    } else {
      console.warn(`Package ${pkg} not found at root level`);
    }
  });
  
  console.log('Metro version fix completed successfully.');
} catch (error) {
  console.error('Error fixing Metro versions:', error);
}