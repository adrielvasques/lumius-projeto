#include "ofApp.h"



//--------------------------------------------------------------
void ofApp::setup(){
    // OpenGL and general settings
    ofDisableArbTex(); // Force GL_TEXTURE_2D
    ofEnableAlphaBlending();
    
    ofBackground(0, 0, 0);
    ofSetFrameRate(30);
    ofSetWindowShape(1920, 1080);
    ofSetFullscreen(true);
    ofSetEscapeQuitsApp(false);

    // Load music with default OpenAL player
    if(music.load("music.wav")) {
        music.setLoop(true);
        music.setVolume(0.8);
        //music.play();  // Auto-play recommended
        ofLogNotice("Audio") << "Music loaded successfully";
    } else {
        ofLogError("Audio") << "Failed to load music";
    }

    // Audio input setup (external audio input/microphone)
    ofSoundStreamSettings settings;
    settings.setInListener(this);
    settings.sampleRate = 44100;
    settings.numOutputChannels = 0;
    settings.numInputChannels = 2;
    settings.bufferSize = 256;
    soundStream.setup(settings);

    // Initialize audio analysis buffers and levels
    audioBuffer.resize(256);
    audioLevel = bassLevel = midLevel = highLevel = 0.0;

    // Load Shaders
    shader1.load("shader1");
    shader2.load("shader2");
    shader3.load("shader3");
    shader4.load("shader4");
    shader5.load("shader5");

    // Fire effect shaders (multi-pass)
    fireEdge.load("fireEdgePass");  // Full fire effect shader
    preMult.load("premultiplyPass");
    edgeDebug.load("edgeDebug");    // Debug shader for edge detection
    
    // Two-pass fire effect shaders
    edgePass.load("edgePass");      // Edge detection pass
    auraPass.load("auraPass");      // Aura diffusion pass
    
    // Psychedelic camera shader
    psychedelic.load("psychedelic"); // Psychedelic effects shader
    
    // Matrix effect shaders (two-pass)
    matrixEdge.load("matrixEdge");   // Matrix edge detection
    matrixEffect.load("matrixEffect"); // Matrix ASCII effect

    currentShader = 1;

    // Setup plane for shader rendering
    plane.set(ofGetWidth(), ofGetHeight());
    plane.setPosition(ofGetWidth() / 2.0, ofGetHeight() / 2.0, 0);
    
// se também precisa flip vertical (caso sua webcam venha invertida):
// plane.mapTexCoords(1.0, 1.0,   // superior-direito → inferior-esquerdo
//                    0.0, 0.0);  // inferior-esquerdo → superior-direito

    // Allocate and clear FBOs for shader 6 (multi-pass rendering)
    fboPing.allocate(ofGetWidth(), ofGetHeight(), GL_RGBA);
    fboPong.allocate(ofGetWidth(), ofGetHeight(), GL_RGBA);

    fboPing.begin();
    ofClear(0, 0, 0, 255);
    fboPing.end();

    fboPong.begin();
    ofClear(0, 0, 0, 255);
    fboPong.end();
    
    // Two-pass fire effect FBOs
    int w = ofGetWidth();
    int h = ofGetHeight();
    edgeFbo.allocate(w, h, GL_RGBA);           // stores pure edges
    auraPing.allocate(w/2, h/2, GL_RGBA);      // aura low-res for blurring
    auraPong.allocate(w/2, h/2, GL_RGBA);
    auraUsePing = true;
    
    // Matrix effect FBO
    matrixEdgeFbo.allocate(w, h, GL_RGBA);     // stores matrix edge detection
    
    edgeFbo.begin();  ofClear(0,0,0,255); edgeFbo.end();
    auraPing.begin(); ofClear(0,0,0,255); auraPing.end();
    auraPong.begin(); ofClear(0,0,0,255); auraPong.end();
    matrixEdgeFbo.begin(); ofClear(0,0,0,255); matrixEdgeFbo.end();

    // Initialize control variables
    speedMultiplier = 1.0;
    intensityMultiplier = 1.0;
    volumeLevel = 0.5;
    currentEffect = 1;
    rgbR = rgbG = rgbB = 1.0;
    cameraActive = false;
    lastMusicCommand = "";
    
    // Initialize audio smoothing variables
    smoothedLevel = bassSmooth = midSmooth = highSmooth = 0.0f;
    smoothing = 0.90f;   // 0.90–0.95 deixa bem estável

    // Create default control file
    ofBuffer defaultConfig;
    defaultConfig.append("effect:1\n");
    defaultConfig.append("rgb_r:255\n");
    defaultConfig.append("rgb_g:255\n");
    defaultConfig.append("rgb_b:255\n");
    defaultConfig.append("speed:1.0\n");
    defaultConfig.append("intensity:1.0\n");
    defaultConfig.append("volume:50\n");

    ofBufferToFile("control.txt", defaultConfig);
    ofLogNotice("Control") << "Default control file created";

    // Optional status font (disabled for performance)
    statusFont.load("Courier New Bold.ttf", 18);

    // Camera setup deferred
    vidGrabber.setVerbose(false);

    // Print OpenGL version info
    ofLogNotice("OpenGL") << "OpenGL Version: " << glGetString(GL_VERSION);
    ofLogNotice("OpenGL") << "OpenGL Vendor: " << glGetString(GL_VENDOR);
    ofLogNotice("OpenGL") << "OpenGL Renderer: " << glGetString(GL_RENDERER);
    ofLogNotice("OpenGL") << "GLSL Version: " << glGetString(GL_SHADING_LANGUAGE_VERSION);

    ofLogNotice("Setup") << "Audio-reactive shader visualizer ready!";
    ofLogNotice("Controls") << "Press keys 1-6 to switch shaders or use control panel.";
}
//--------------------------------------------------------------
void ofApp::update(){
	analyzeAudio();
	readControlFile();
	
	// Update camera only if active
	if(cameraActive) {
		vidGrabber.update();
	}
	// suaviza em 1 linha: y = y_old * a  +  x * (1-a)
smoothedLevel = smoothing * smoothedLevel + (1.0f - smoothing) * audioLevel;
bassSmooth    = smoothing * bassSmooth    + (1.0f - smoothing) * bassLevel;
midSmooth     = smoothing * midSmooth     + (1.0f - smoothing) * midLevel;
highSmooth    = smoothing * highSmooth    + (1.0f - smoothing) * highLevel;




}

//--------------------------------------------------------------
void ofApp::readControlFile() {
	ofFile controlFile("control.txt");
	if(controlFile.exists()) {
		ofBuffer buffer = controlFile.readToBuffer();
		for(auto line : buffer.getLines()) {
			vector<string> parts = ofSplitString(line, ":");
			if(parts.size() == 2) {
				if(parts[0] == "effect") {
					int newEffect = ofToInt(parts[1]);
					if(newEffect >= 1 && newEffect <= 8) {
						// Check if switching to/from camera shader
						bool needsCamera = (newEffect == 5 || newEffect == 6 || newEffect == 7 || newEffect == 8);
						bool currentNeedsCamera = (currentShader == 5 || currentShader == 6 || currentShader == 7 || currentShader == 8);
						
						if(needsCamera && !currentNeedsCamera) {
							activateCamera();
						} else if(!needsCamera && currentNeedsCamera) {
							deactivateCamera();
						}
						
						// Map effects to shaders
						if(newEffect <= 4) {
							currentShader = newEffect;
						} else if(newEffect == 5) {
							currentShader = 5; // Camera effect
						} else if(newEffect == 6) {
							currentShader = 6; // Fire edge effect
						} else if(newEffect == 7) {
							currentShader = 7; // Matrix effect
						} else if(newEffect == 8) {
							currentShader = 8; // Psychedelic effect
						} else {
							currentShader = 1; // Other effects -> Shader1 for now
						}
						currentEffect = newEffect;
					}
				}
				else if(parts[0] == "rgb_r") {
					rgbR = ofClamp(ofToInt(parts[1]), 0, 255) / 255.0;
				}
				else if(parts[0] == "rgb_g") {
					rgbG = ofClamp(ofToInt(parts[1]), 0, 255) / 255.0;
				}
				else if(parts[0] == "rgb_b") {
					rgbB = ofClamp(ofToInt(parts[1]), 0, 255) / 255.0;
				}
				else if(parts[0] == "speed") {
					speedMultiplier = ofToFloat(parts[1]);
				}
				else if(parts[0] == "intensity") {
					intensityMultiplier = ofToFloat(parts[1]);
				}
				else if(parts[0] == "volume") {
					volumeLevel = ofToFloat(parts[1]) / 100.0;
					music.setVolume(volumeLevel);
				}
				else if(parts[0] == "music") {
					// Only process if command changed
					if(parts[1] != lastMusicCommand) {
						lastMusicCommand = parts[1];
						
						if(parts[1] == "play") {
							music.setPaused(false);
							if(!music.isPlaying()) {
								music.play();
							}
							ofLogNotice("Music") << "Playing";
						}
						else if(parts[1] == "pause") {
							music.setPaused(true);
							ofLogNotice("Music") << "Paused";
						}
					}
				}

			}
		}
	}
}

//--------------------------------------------------------------
void ofApp::analyzeAudio() {
	// Get audio data from music player
	float * audioData = ofSoundGetSpectrum(256);
	
	if(audioData == nullptr) {
		// Fallback: generate fake audio data based on time
		float t = ofGetElapsedTimef();
		bassLevel = (sin(t * 2.0) + 1.0) * 0.3;
		midLevel = (sin(t * 3.0) + 1.0) * 0.2;
		highLevel = (sin(t * 5.0) + 1.0) * 0.1;
		audioLevel = (bassLevel + midLevel + highLevel) / 3.0;
		return;
	}
	
	// Calculate levels for different frequency ranges
	bassLevel = 0;
	midLevel = 0;
	highLevel = 0;
	audioLevel = 0;
	
	// Bass: 0-85 Hz (roughly bins 0-10)
	for(int i = 0; i < 10; i++) {
		bassLevel += audioData[i];
	}
	bassLevel /= 10.0;
	
	// Mid: 85-2000 Hz (roughly bins 10-100)
	for(int i = 10; i < 100; i++) {
		midLevel += audioData[i];
	}
	midLevel /= 90.0;
	
	// High: 2000+ Hz (bins 100-255)
	for(int i = 100; i < 256; i++) {
		highLevel += audioData[i];
	}
	highLevel /= 156.0;
	
	// Overall level
	for(int i = 0; i < 256; i++) {
		audioLevel += audioData[i];
	}
	audioLevel /= 256.0;
	
	// Smooth and amplify - EXTREME amplification for maximum visual impact!
	bassLevel = ofClamp(bassLevel * 15.0, 0.0, 1.0);  // 3x stronger bass detection
	midLevel = ofClamp(midLevel * 10.0, 0.0, 1.0);    // 3x stronger mid detection
	highLevel = ofClamp(highLevel * 8.0, 0.0, 1.0);   // 4x stronger high detection
	audioLevel = ofClamp(audioLevel * 12.0, 0.0, 1.0); // 3x stronger overall detection
}

//--------------------------------------------------------------
void ofApp::audioIn(ofSoundBuffer & input) {
	// Disabled - no longer using audio input
}

//--------------------------------------------------------------
void ofApp::drawShader() {
	ofShader* currentShaderPtr = (currentShader == 1) ? &shader1 : (currentShader == 2) ? &shader2 : (currentShader == 3) ? &shader3 : (currentShader == 4) ? &shader4 : (currentShader == 5) ? &shader5 : &shader6;

    if (currentShader <= 4) {
        currentShaderPtr->begin();
        currentShaderPtr->setUniform1f("time", ofGetElapsedTimef() * speedMultiplier);
        currentShaderPtr->setUniform2f("resolution", ofGetWidth(), ofGetHeight());
        currentShaderPtr->setUniform1f("audioLevel", audioLevel * intensityMultiplier);
        currentShaderPtr->setUniform1f("bassLevel", bassLevel * intensityMultiplier);
        currentShaderPtr->setUniform1f("midLevel", midLevel * intensityMultiplier);
        currentShaderPtr->setUniform1f("highLevel", highLevel * intensityMultiplier);
        currentShaderPtr->setUniform3f("rgbMod", rgbR, rgbG, rgbB);
        currentShaderPtr->setUniform1i("effectMode", currentEffect);
        plane.draw();
        currentShaderPtr->end();
    } else if (currentShader == 5) {
        // Render shader5 directly without bufferization
        currentShaderPtr->begin();
        currentShaderPtr->setUniform1f("time", ofGetElapsedTimef() * speedMultiplier);
        currentShaderPtr->setUniform2f("resolution", ofGetWidth(), ofGetHeight());
        currentShaderPtr->setUniform1f("audioLevel", audioLevel * intensityMultiplier);
        currentShaderPtr->setUniform1f("bassLevel", bassLevel * intensityMultiplier);
        currentShaderPtr->setUniform1f("midLevel", midLevel * intensityMultiplier);
        currentShaderPtr->setUniform1f("highLevel", highLevel * intensityMultiplier);
        currentShaderPtr->setUniform3f("rgbMod", rgbR, rgbG, rgbB);
        currentShaderPtr->setUniform1i("effectMode", currentEffect);
		currentShaderPtr->setUniformTexture("cameraTexture", vidGrabber.getTexture(), 0);
        plane.draw();
        currentShaderPtr->end();
	
	} else if (currentShader == 6) {
		// Two-pass fire effect: Edge detection + Aura diffusion
		int w = ofGetWidth();
		int h = ofGetHeight();
		
		//------------------------------------------------ PASSO A – bordas
		edgeFbo.begin();
		ofClear(0,0,0,0);  // Transparente total
		edgePass.begin();
		edgePass.setUniformTexture("cameraTexture", vidGrabber.getTexture(), 0);
		edgePass.setUniform2f("resolution", w, h);
		edgePass.setUniform1f("time", ofGetElapsedTimef()); // Pure time
		edgePass.setUniform1f("speed", speedMultiplier); // Speed as separate uniform
		edgePass.setUniform1f("audioLevel", smoothedLevel);  // Remove intensity multiplier
		edgePass.setUniform1f("bassLevel", bassSmooth);      // Remove intensity multiplier  
		edgePass.setUniform1f("midLevel", midSmooth);        // Remove intensity multiplier
		edgePass.setUniform1f("highLevel", highSmooth);      // Remove intensity multiplier
		edgePass.setUniform3f("rgbMod", rgbR, rgbG, rgbB);
		plane.draw();
		edgePass.end();
		edgeFbo.end();

		//------------------------------------------------ PASSO B – aura ping-pong
		ofFbo &aPrev = auraUsePing ? auraPong : auraPing;
		ofFbo &aDest = auraUsePing ? auraPing : auraPong;

		aDest.begin();
		ofClear(0,0,0,0);  // Transparente total para evitar fundo branco
		auraPass.begin();
		auraPass.setUniformTexture("prevAura", aPrev.getTexture(), 0);
		auraPass.setUniformTexture("edgeMask", edgeFbo.getTexture(), 1);
		auraPass.setUniform2f("resolution", aDest.getWidth(), aDest.getHeight());
		auraPass.setUniform1f("time", ofGetElapsedTimef());
		auraPass.setUniform1f("speed", speedMultiplier);
		auraPass.setUniform1f("audioLevel", smoothedLevel * intensityMultiplier);  // Remove intensity multiplier
		auraPass.setUniform1f("bassLevel", bassSmooth * intensityMultiplier);      // Remove intensity multiplier
		auraPass.setUniform1f("midLevel", midSmooth * intensityMultiplier);        // Remove intensity multiplier
		auraPass.setUniform1f("highLevel", highSmooth * intensityMultiplier);      // Remove intensity multiplier
		auraPass.setUniform3f("rgbMod", rgbR, rgbG, rgbB);
		plane.draw();
		auraPass.end();
		aDest.end();
		auraUsePing = !auraUsePing;

		//------------------------------------------------ PASSO C – upsample & mostrar com transparência
		// Habilita blending aditivo para evitar fundo branco
		ofEnableBlendMode(OF_BLENDMODE_ADD);
		ofSetColor(255, 255, 255, 255);    // Ensure full color
		
		// Draw with correct aspect ratio and flip for proper orientation
		ofPushMatrix();
		ofScale(1, -1);  // Only flip vertically
		ofTranslate(0, -h);  // Translate back to visible area
		aDest.draw(0, 0, w, h);
		ofPopMatrix();
		
		// Restaura blending normal
		ofEnableBlendMode(OF_BLENDMODE_ALPHA);
	
	} else if (currentShader == 7) {
		// Matrix effect: Two-pass shader (Edge detection + ASCII effect)
		if (!cameraActive || !vidGrabber.isInitialized()) {
			ofLogError("Matrix") << "Camera not active or initialized";
			return;
		}
		
		int w = ofGetWidth();
		int h = ofGetHeight();
		
		//------------------------------------------------ PASS 1 – Matrix Edge Detection
		matrixEdgeFbo.begin();
		ofClear(0,0,0,0);
		matrixEdge.begin();
		matrixEdge.setUniformTexture("cameraTexture", vidGrabber.getTexture(), 0);
		matrixEdge.setUniform2f("resolution", w, h);
		matrixEdge.setUniform1f("time", ofGetElapsedTimef());
		matrixEdge.setUniform1f("speed", speedMultiplier);
		matrixEdge.setUniform1f("intensity", intensityMultiplier); // Controls ASCII density
		matrixEdge.setUniform1f("audioLevel", smoothedLevel);
		matrixEdge.setUniform1f("bassLevel", bassSmooth);
		matrixEdge.setUniform1f("midLevel", midSmooth);
		matrixEdge.setUniform1f("highLevel", highSmooth);
		matrixEdge.setUniform3f("rgbMod", rgbR, rgbG, rgbB);
		plane.draw();
		matrixEdge.end();
		matrixEdgeFbo.end();
		
		//------------------------------------------------ PASS 2 – Matrix ASCII Effect
		matrixEffect.begin();
		matrixEffect.setUniformTexture("edgeTexture", matrixEdgeFbo.getTexture(), 0);
		matrixEffect.setUniformTexture("cameraTexture", vidGrabber.getTexture(), 1);
		matrixEffect.setUniform2f("resolution", w, h);
		matrixEffect.setUniform1f("time", ofGetElapsedTimef());
		matrixEffect.setUniform1f("speed", speedMultiplier);
		matrixEffect.setUniform1f("intensity", intensityMultiplier); // Controls ASCII density
		matrixEffect.setUniform1f("audioLevel", smoothedLevel);
		matrixEffect.setUniform1f("bassLevel", bassSmooth);
		matrixEffect.setUniform1f("midLevel", midSmooth);
		matrixEffect.setUniform1f("highLevel", highSmooth);
		matrixEffect.setUniform3f("rgbMod", rgbR, rgbG, rgbB);
		
		// Draw with proper orientation
		ofPushMatrix();
		ofScale(1, -1);
		ofTranslate(0, -h);
		plane.draw();
		ofPopMatrix();
		
		matrixEffect.end();
	
	} else if (currentShader == 8) {
		// Psychedelic camera shader
		if (!cameraActive || !vidGrabber.isInitialized()) {
			ofLogError("Psychedelic") << "Camera not active or initialized";
			return;
		}
		
		psychedelic.begin();
		psychedelic.setUniform2f("resolution", ofGetWidth(), ofGetHeight());
		psychedelic.setUniformTexture("cameraTexture", vidGrabber.getTexture(), 0);
		psychedelic.setUniform1f("time", ofGetElapsedTimef()); // Pure time
		psychedelic.setUniform1f("speed", speedMultiplier); // Speed as separate uniform
		psychedelic.setUniform1f("audioLevel", smoothedLevel);  // Smoothed audio
		psychedelic.setUniform1f("bassLevel", bassSmooth);      // Smoothed bass
		psychedelic.setUniform1f("midLevel", midSmooth);        // Smoothed mids
		psychedelic.setUniform1f("highLevel", highSmooth);      // Smoothed highs
		psychedelic.setUniform3f("rgbMod", rgbR, rgbG, rgbB);
		plane.draw();
		psychedelic.end();
	}
}

//--------------------------------------------------------------
void ofApp::draw(){
	drawShader();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){ 
	if (key == '1') {
		currentShader = 1;
		ofLogNotice("Shader") << "Switched to Shader 1 (Waves)";
	} else if (key == '2') {
		currentShader = 2;
		ofLogNotice("Shader") << "Switched to Shader 2 (Chladni)";
	} else if (key == '3') {
		currentShader = 3;
		ofLogNotice("Shader") << "Switched to Shader 3";
	} else if (key == '4') {
		currentShader = 4;
		ofLogNotice("Shader") << "Switched to Shader 4";
	} else if (key == '5') {
		currentShader = 5;
		activateCamera();
		ofLogNotice("Shader") << "Switched to Shader 5 (Camera)";
	} else if (key == '6') {
		currentShader = 6;
		activateCamera();
		ofLogNotice("Shader") << "Switched to Shader 6 (Fire Edge)";
	} else if (key == '7') {
		currentShader = 7;
		activateCamera();
		ofLogNotice("Shader") << "Switched to Shader 7 (Matrix Effect)";
	} else if (key == '8') {
		currentShader = 8;
		activateCamera();
		ofLogNotice("Shader") << "Switched to Shader 8 (Psychedelic)";
	} else if (key == ' ') {
		if (music.isPlaying()) {
			music.setPaused(true);
			ofLogNotice("Audio") << "Music paused";
		} else {
			music.setPaused(false);
			if(!music.isPlaying()) {
				music.play();
			}
			ofLogNotice("Audio") << "Music resumed";
		}
	} else if (key == 'r') {
		music.stop();
		ofSleepMillis(100);
		music.load("music.mp3");
		music.setVolume(0.8);
		music.play();
		ofLogNotice("Audio") << "Music reloaded";
	}
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){ 

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}

//--------------------------------------------------------------
void ofApp::activateCamera() {
	if(!cameraActive) {
		// Kill any processes using the camera
		system("sudo pkill -f v4l2 2>/dev/null || true");
		system("sudo fuser -k /dev/video0 2>/dev/null || true");
		ofSleepMillis(500);
		
		vidGrabber.setVerbose(false); // Reduce verbose output
		vidGrabber.setDeviceID(0);
		vidGrabber.setDesiredFrameRate(24); // Lower framerate for performance
		if(vidGrabber.setup(320, 240)) { // Lower resolution for performance
			ofLogNotice("Camera") << "Camera activated successfully";
			cameraActive = true;
		} else {
			ofLogError("Camera") << "Failed to activate camera";
		}
	}
}

//--------------------------------------------------------------
void ofApp::deactivateCamera() {
	if(cameraActive) {
		vidGrabber.close();
		ofLogNotice("Camera") << "Camera deactivated";
		cameraActive = false;
	}
}

//--------------------------------------------------------------
void ofApp::drawStatusOverlay() {
	// Simple text overlay - top left corner
	ofSetColor(255, 255, 255); // White text
	
	// Current shader
	statusFont.drawString("Shader: " + ofToString(currentShader), 20, 30);
	
	// Current effect
	string effectNames[] = {"", "Neural Waves", "Chladni Patterns", "Burst Matrix", "Quantum Field", "Camera Distort", "Depth Scanner", "Face Morph"};
	string currentEffectName = (currentEffect >= 1 && currentEffect <= 7) ? effectNames[currentEffect] : "Unknown";
	statusFont.drawString("Effect: " + currentEffectName, 20, 55);
	
	// Audio levels
	statusFont.drawString("Audio: " + ofToString(audioLevel, 2), 20, 80);
	statusFont.drawString("Bass: " + ofToString(bassLevel, 2), 20, 105);
	
	// Camera status
	if(cameraActive) {
		statusFont.drawString("Camera: ON", 20, 130);
	} else {
		statusFont.drawString("Camera: OFF", 20, 130);
	}
}