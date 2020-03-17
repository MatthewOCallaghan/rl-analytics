import React from 'react';
import Particles from 'react-particles-js';

const particlesOptions = {
    particles: {
      number: {
        value: 70,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
};

const ParticlesComponent = () => {
    return <Particles className='particles' params={particlesOptions} style={{backgroundColor: 'black'}} />;
}

export default ParticlesComponent;