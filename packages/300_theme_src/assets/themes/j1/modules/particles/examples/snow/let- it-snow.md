
See:  https://codepen.io/dariodev/pen/JRqbgK

## HTML

<!-- particles.js container -->
<div id="particles-js"></div>
<!-- particles.js lib - https://github.com/VincentGarreau/particles.js
<script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>-->
<!-- content -->
<div class="content">
  <h1>Let it snow</h1>
</div>

## Javascript

// assets/sprites/snowflakes.png
// https://github.com/photonstorm/phaser-examples/tree/master/examples/assets/sprites/snowflakes.png

particlesJS("particles-js", {
  particles: {
    number: {
      value: 52,
      density: {
        enable: true,
        value_area: 631.3280775270874
      }
    },
    color: {
      value: "#fff"
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0,
        color: "#000000"
      },
      polygon: {
        nb_sides: 5
      },
      image: {
        src: "img/github.svg",
        width: 100,
        height: 100
      }
    },
    opacity: {
      value: 0.5,
      random: true,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 5,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false
      }
    },
    line_linked: {
      enable: false,
      distance: 500,
      color: "#ffffff",
      opacity: 0.4,
      width: 2
    },
    move: {
      enable: true,
      speed: 1.5,
      direction: "bottom",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: false,
        mode: "bubble"
      },
      onclick: {
        enable: true,
        mode: "repulse"
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 0.5
        }
      },
      bubble: {
        distance: 400,
        size: 4,
        duration: 0.3,
        opacity: 1,
        speed: 3
      },
      repulse: {
        distance: 200,
        duration: 0.4
      },
      push: {
        particles_nb: 4
      },
      remove: {
        particles_nb: 2
      }
    }
  },
  retina_detect: true
});


## CSS

@import url("https://fonts.googleapis.com/css?family=Molle:400i");
body {
  margin: 0;
  background-color: #1f263b;
}

h1 {
  color: #cfcfcf;
  font-family: "Molle", cursive;
  font-size: 5em;
}

.content {
  max-width: 70%;
  height: 300px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  vertical-align: bottom;
}

/* ---- particles.js container ---- */

#particles-js {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}
