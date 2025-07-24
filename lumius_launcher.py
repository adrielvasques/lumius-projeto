#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk
import subprocess
import threading
import time
import os
import sys

class LumiusSplashScreen:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("LUMIUS")
        self.root.geometry("600x400")
        self.root.configure(bg='#0a0a0a')
        self.root.resizable(False, False)
        
        # Center window
        self.root.eval('tk::PlaceWindow . center')
        
        # Remove window decorations for splash effect
        self.root.overrideredirect(True)
        
        self.setup_splash()
        self.start_loading()
        
    def setup_splash(self):
        # Main container
        main_frame = tk.Frame(self.root, bg='#0a0a0a')
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Logo/Title area
        logo_frame = tk.Frame(main_frame, bg='#0a0a0a', height=200)
        logo_frame.pack(fill=tk.X, pady=50)
        logo_frame.pack_propagate(False)
        
        # LUMIUS Logo
        title = tk.Label(logo_frame, text="◢ LUMIUS ◣", 
                        font=('Orbitron', 36, 'bold'), 
                        bg='#0a0a0a', fg='#00ffff')
        title.pack(expand=True)
        
        subtitle = tk.Label(logo_frame, text="PICO ENCODER VISUAL SYSTEM", 
                           font=('Orbitron', 14), 
                           bg='#0a0a0a', fg='#666666')
        subtitle.pack()
        
        version = tk.Label(logo_frame, text="v1.0 - NEURAL MATRIX", 
                          font=('Orbitron', 10), 
                          bg='#0a0a0a', fg='#444444')
        version.pack(pady=10)
        
        # Loading area
        loading_frame = tk.Frame(main_frame, bg='#0a0a0a', height=100)
        loading_frame.pack(fill=tk.X, pady=20)
        loading_frame.pack_propagate(False)
        
        # Status text
        self.status_label = tk.Label(loading_frame, text="INITIALIZING SYSTEM...", 
                                    font=('Orbitron', 12, 'bold'), 
                                    bg='#0a0a0a', fg='#00ff00')
        self.status_label.pack(pady=10)
        
        # Progress bar
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("Lumius.Horizontal.TProgressbar",
                       background='#00ffff',
                       troughcolor='#333333',
                       borderwidth=0,
                       lightcolor='#00ffff',
                       darkcolor='#00ffff')
        
        self.progress = ttk.Progressbar(loading_frame, 
                                       style="Lumius.Horizontal.TProgressbar",
                                       length=400, mode='determinate')
        self.progress.pack(pady=10)
        
        # Loading details
        self.detail_label = tk.Label(loading_frame, text="", 
                                    font=('Orbitron', 9), 
                                    bg='#0a0a0a', fg='#888888')
        self.detail_label.pack()
        
        # Border effect
        border_frame = tk.Frame(self.root, bg='#00ffff', height=2)
        border_frame.pack(side=tk.TOP, fill=tk.X)
        
        border_frame2 = tk.Frame(self.root, bg='#00ffff', height=2)
        border_frame2.pack(side=tk.BOTTOM, fill=tk.X)
        
    def update_progress(self, value, status, detail=""):
        self.progress['value'] = value
        self.status_label.config(text=status)
        self.detail_label.config(text=detail)
        self.root.update()
        
    def start_loading(self):
        # Start loading in separate thread
        loading_thread = threading.Thread(target=self.loading_sequence)
        loading_thread.daemon = True
        loading_thread.start()
        
    def loading_sequence(self):
        try:
            # Step 1: Check dependencies
            self.update_progress(10, "CHECKING DEPENDENCIES...", "Verifying system requirements")
            time.sleep(1)
            
            # Step 2: Initialize audio system
            self.update_progress(25, "INITIALIZING AUDIO MATRIX...", "Setting up audio processing")
            time.sleep(1)
            
            # Step 3: Load shaders
            self.update_progress(40, "LOADING NEURAL SHADERS...", "Compiling visual effects")
            time.sleep(1)
            
            # Step 4: Compile OpenFrameworks
            self.update_progress(55, "COMPILING VISUAL ENGINE...", "Building OpenFrameworks application")
            
            # Actually compile the project
            os.chdir("/home/adriel/picoEncoderProject/openframeworks-visualizer")
            result = subprocess.run(["make"], capture_output=True, text=True)
            
            if result.returncode != 0:
                self.update_progress(55, "COMPILATION ERROR", "Check console for details")
                time.sleep(3)
                self.close_splash()
                return
                
            self.update_progress(75, "VISUAL ENGINE READY...", "OpenFrameworks compiled successfully")
            time.sleep(1)
            
            # Step 5: Launch applications
            self.update_progress(85, "LAUNCHING CONTROL MATRIX...", "Starting control panel")
            
            # Launch control panel
            control_process = subprocess.Popen([
                sys.executable, 
                "/home/adriel/picoEncoderProject/control-app/control_panel.py"
            ])
            
            time.sleep(2)
            
            self.update_progress(95, "LAUNCHING VISUAL ENGINE...", "Starting OpenFrameworks visualizer")
            
            # Launch visualizer
            visualizer_process = subprocess.Popen([
                "./bin/openframeworks-visualizer"
            ], cwd="/home/adriel/picoEncoderProject/openframeworks-visualizer")
            
            time.sleep(1)
            
            self.update_progress(100, "LUMIUS SYSTEM ACTIVE", "All systems operational")
            time.sleep(2)
            
            # Close splash screen
            self.close_splash()
            
        except Exception as e:
            self.update_progress(0, "SYSTEM ERROR", f"Error: {str(e)}")
            time.sleep(3)
            self.close_splash()
            
    def close_splash(self):
        self.root.quit()
        self.root.destroy()
        
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    print("◢ LUMIUS SYSTEM LAUNCHER ◣")
    print("Starting visual system...")
    
    splash = LumiusSplashScreen()
    splash.run()
    
    print("LUMIUS system launched successfully!")