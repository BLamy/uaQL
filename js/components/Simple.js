import React from 'react';
import React3 from 'react-three-renderer';
import THREE from 'three';
import ReactDOM from 'react-dom';

class Simple extends React.Component {
  constructor(props, context) {
    super(props, context);

    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.
    this.cameraPosition = new THREE.Vector3(0, 0, 5);

    this.state = {
      cubeRotation: new THREE.Euler(),
    };

    this._onAnimate = () => {
      // we will get this callback every frame

      // pretend cubeRotation is immutable.
      // this helps with updates and pure rendering.
      // React will be sure that the rotation has now updated.
      this.setState({
        cubeRotation: new THREE.Euler(
          this.state.cubeRotation.x + 0.1,
          this.state.cubeRotation.y + 0.1,
          0
        ),
      });
    };
  }

  render() {
    const width = window.innerWidth; // canvas width
    const height = window.innerHeight; // canvas height

    return (
      <React3
        mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
        width={300}
        height={200}
        onAnimate={this._onAnimate}
        >
        <scene>
          <perspectiveCamera
            name="camera"
            fov={75}
            aspect={width / height}
            near={0.1}
            far={1000}
            position={this.cameraPosition}
            />
          <mesh
            position = {new THREE.Vector3(1,1,1)}
            >
            <boxGeometry
              width={1}
              height={1}
              depth={1}
              />
            <meshBasicMaterial
              color={0xe0000f}
              />
          </mesh>
          <mesh
            rotation={this.state.cubeRotation}
            >
            <octahedronGeometry radius={1} detail={1}/>
            <meshDepthMaterial
              color= {0x00ff00}/>
          </mesh>
        </scene>
      </React3>
    );
  }
}
export default Simple;