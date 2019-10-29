import React, { Component, Fragment } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';

// own components
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

const particleOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const app = new Clarifai.App({
 apiKey: '0188dad1d63f4aa3be99ff4db5167386'
});

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageURL: '',
      faceBox: {},
      route: 'signIn',
      isSignIn: false
    }
  }

  calculateFaceLocation(data){
    const clarifaiFaceRegion = data.outputs[0].data.regions[0].region_info.bounding_box;
    const inputImage = document.getElementById('inputImage');
    const width  = Number(inputImage.width);
    const height = Number(inputImage.height);
    
    const boundingValues = {
        leftColumn  : width * Number(clarifaiFaceRegion.left_col),
        rightColumn : width - (width * Number(clarifaiFaceRegion.right_col)),
        topRow      : height * Number(clarifaiFaceRegion.top_row),
        bottomRow   : height - (height * Number(clarifaiFaceRegion.bottom_row))
      }
    return boundingValues;
  }

  setFaceBox(faceBox){
    this.setState({faceBox: faceBox});
  }

  onInputChange = (event) =>{
    this.setState({input: event.target.value});
  }

  onButtonClick = () => {
    this.setState({imageURL: this.state.input});
    // clarifai api
    app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
      .then(response => this.setFaceBox(this.calculateFaceLocation(response)))
      .catch( err => console.log(err));
  }

  onRouteChange = (route) => {
    route === 'home' ? this.setState({isSignIn: true}) : this.setState({isSignIn: false});
    this.setState({route: route});
  }

  render(){
    let componentsToRender;

    switch(this.state.route){
      case 'signIn':
        componentsToRender = <SignIn onRouteChange={this.onRouteChange}/>;
        break;
      case 'register':
        componentsToRender = <Register onRouteChange={this.onRouteChange}/>;
        break;
      default:
        componentsToRender = (<Fragment> 
                                <Logo />
                                <Rank />
                                <ImageLinkForm inputChange={this.onInputChange} buttonClick={this.onButtonClick}/>
                                <FaceRecognition imageURL={this.state.imageURL} boxModel={this.state.faceBox}/>
                              </Fragment>)
    }

    return (
      <div className="App">
        <Particles params={particleOptions} className="particles"/>
        <Navigation onRouteChange={this.onRouteChange} isSignIn={this.state.isSignIn} />
        {componentsToRender}
      </div>
    );
  }
}

export default App;
// https://www.goldennumber.net/wp-content/uploads/2013/08/florence-colgate-england-most-beautiful-face.jpg
