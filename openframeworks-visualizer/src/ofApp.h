#pragma once

#include "ofMain.h"

class ofApp : public ofBaseApp{
	
	public:
		
		void setup();
		void update();
		void draw();
		
		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y );
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void mouseEntered(int x, int y);
		void mouseExited(int x, int y);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);		
		
		// Audio
		ofSoundPlayer music;
		ofSoundStream soundStream;
		vector<float> audioBuffer;
		float audioLevel;
		float bassLevel, midLevel, highLevel;
		
		// Audio smoothing variables
		float smoothedLevel, bassSmooth, midSmooth, highSmooth;
		float smoothing;
		
		// Shaders
		ofShader shader1, shader2, shader3, shader4, shader5, shader6;
		ofShader fireEdge, preMult, edgeDebug;
		ofShader edgePass, auraPass;  // Two-pass fire effect shaders
		ofShader psychedelic;  // Psychedelic camera shader
		ofShader matrixEdge, matrixEffect;  // Matrix effect shaders
		int currentShader;
		ofPlanePrimitive plane;
		bool usePing = true;   // alterna a cada frame

		
		// Camera
		ofVideoGrabber vidGrabber;
		
		// Feedback buffer for shader2
		ofFbo feedbackBuffer;
		
		// Fire effect FBOs
		ofFbo fboPing, fboPong, fboAudio;
		
		// Two-pass fire effect FBOs
		ofFbo edgeFbo;           // stores pure edges
		ofFbo auraPing, auraPong; // aura low-res for blurring
		bool auraUsePing;
		
		// Matrix effect FBO
		ofFbo matrixEdgeFbo;     // stores matrix edge detection
		
		// Audio analysis
		void audioIn(ofSoundBuffer & input);
		void analyzeAudio();
		
		// Control variables
		float speedMultiplier;
		float intensityMultiplier;
		float volumeLevel;
		int currentEffect;
		float rgbR, rgbG, rgbB;
		string lastMusicCommand;
		
		// Control file reading
		void readControlFile();
		
		// Shader management
		void drawShader();
		void drawStatusOverlay();
		
		// Camera management
		void activateCamera();
		void deactivateCamera();
		bool cameraActive;
		
		// Font for status display
		ofTrueTypeFont statusFont;
		
	private:
		ofFbo bufferA; // Framebuffer for fireEdgePass
		ofFbo bufferB; // Framebuffer for premultiplyPass
		ofShader fireEdgeShader; // Shader for Sobel edge detection
		ofShader premultiplyShader; // Shader for fire effect
		ofTexture cameraTexture; // Camera texture
};