window.patch = async (root, tex, THREE) => {
  tex.flipY = false; tex.needsUpdate = true;
  root.traverse(o => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      if (m.name === 'BsXHDwLKqtDOfrW') { m.emissiveMap = tex; m.emissive = new THREE.Color(1, 1, 1); m.emissiveIntensity = +(new URLSearchParams(location.search).get('glow') || 1); m.color = new THREE.Color(0, 0, 0); m.toneMapped = false; m.needsUpdate = true; window.info.screenMesh = o.name; }
    }
  });
};
