#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk
import math
import os
import paramiko
import subprocess

class LumiusControlPanel:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("LUMIUS - REMOTE VISUAL SYNTHESIS CONTROL")
        self.root.geometry("900x850")
        self.root.configure(bg='#0a0a0a')
        self.root.resizable(True, True)
        
        # SSH connection settings
        self.ssh_host = "192.168.0.17"
        self.ssh_user = "lumius"
        self.ssh_client = None
        self.connected = False
        
        # Remote control file path
        self.control_file = "/home/lumius/lumius_project/openframeworks-visualizer/bin/data/control.txt"
        
        # Variables
        self.current_effect = tk.IntVar(value=1)
        self.rgb_r = tk.IntVar(value=255)
        self.rgb_g = tk.IntVar(value=255)
        self.rgb_b = tk.IntVar(value=255)
        self.rgb_active = tk.StringVar(value="r")
        self.speed = tk.DoubleVar(value=1.0)
        self.intensity = tk.DoubleVar(value=1.0)
        self.volume = tk.DoubleVar(value=50)
        
        self.setup_connection_ui()
        self.setup_ui()
        
    def setup_connection_ui(self):
        # Connection panel at top
        conn_frame = tk.Frame(self.root, bg='#0a0a0a', height=50)
        conn_frame.pack(fill=tk.X, padx=20, pady=5)
        conn_frame.pack_propagate(False)
        
        tk.Label(conn_frame, text="◢ REMOTE CONNECTION ◣", 
                font=('Orbitron', 12, 'bold'), bg='#0a0a0a', fg='#00ffff').pack()
        
        # Connection controls in one line
        conn_controls = tk.Frame(conn_frame, bg='#0a0a0a')
        conn_controls.pack()
        
        tk.Label(conn_controls, text="IP:", bg='#0a0a0a', fg='#ffffff', font=('Orbitron', 9)).pack(side=tk.LEFT)
        self.ip_entry = tk.Entry(conn_controls, width=12, font=('Orbitron', 8))
        self.ip_entry.insert(0, self.ssh_host)
        self.ip_entry.pack(side=tk.LEFT, padx=2)
        
        tk.Label(conn_controls, text="Pass:", bg='#0a0a0a', fg='#ffffff', font=('Orbitron', 9)).pack(side=tk.LEFT, padx=(10,0))
        self.pass_entry = tk.Entry(conn_controls, show="*", width=10, font=('Orbitron', 8))
        self.pass_entry.pack(side=tk.LEFT, padx=2)
        
        self.connect_btn = tk.Button(conn_controls, text="CONNECT", command=self.connect_ssh,
                                   bg='#003300', fg='#00ff00', font=('Orbitron', 9, 'bold'), width=8)
        self.connect_btn.pack(side=tk.LEFT, padx=5)
        
        self.conn_status = tk.Label(conn_controls, text="DISCONNECTED", 
                                  bg='#0a0a0a', fg='#ff0000', font=('Orbitron', 9, 'bold'))
        self.conn_status.pack(side=tk.LEFT, padx=5)
        
    def setup_ui(self):
        # Main title with Lumius branding
        title_frame = tk.Frame(self.root, bg='#0a0a0a', height=60)
        title_frame.pack(fill=tk.X, pady=10)
        title_frame.pack_propagate(False)
        
        title = tk.Label(title_frame, text="◢ LUMIUS VISUAL SYNTHESIS ◣", 
                        font=('Orbitron', 18, 'bold'), 
                        bg='#0a0a0a', fg='#00ffff')
        title.pack(expand=True)
        
        subtitle1 = tk.Label(title_frame, text="GENERATIVE & CAMERA REACTIVE VISUALS", 
                            font=('Orbitron', 12), 
                            bg='#0a0a0a', fg='#666666')
        subtitle1.pack()
        
        subtitle2 = tk.Label(title_frame, text="REAL-TIME AUDIO VISUAL SYNTHESIS", 
                            font=('Orbitron', 10), 
                            bg='#0a0a0a', fg='#555555')
        subtitle2.pack()
        
        # Main grid container
        main_grid = tk.Frame(self.root, bg='#0a0a0a')
        main_grid.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Configure grid weights for equal distribution
        main_grid.grid_rowconfigure(0, weight=2)  # Effects panel gets more space
        main_grid.grid_rowconfigure(1, weight=1)
        main_grid.grid_columnconfigure(0, weight=1)
        main_grid.grid_columnconfigure(1, weight=1)
        main_grid.grid_columnconfigure(2, weight=1)
        
        # Create modular panels - separate generative and camera
        self.create_generative_panel(main_grid, 0, 0, 1, 1)
        self.create_camera_panel(main_grid, 0, 1, 1, 1)
        self.create_audio_panel(main_grid, 0, 2, 1, 1)
        self.create_rgb_panel(main_grid, 1, 0, 1, 1)
        self.create_control_panel(main_grid, 1, 1, 1, 1)
        self.create_status_panel(main_grid, 1, 2, 1, 1)
        
    def create_panel_frame(self, parent, title, color):
        """Create a standardized panel frame"""
        frame = tk.LabelFrame(parent, text=f"◆ {title}", 
                             font=('Orbitron', 12, 'bold'),
                             bg='#1a1a1a', fg=color, bd=3, relief=tk.RAISED,
                             padx=10, pady=10)
        return frame
        
    def create_generative_panel(self, parent, row, col, colspan, rowspan):
        panel = self.create_panel_frame(parent, "GENERATIVE ART", '#00ff00')
        panel.grid(row=row, column=col, columnspan=colspan, rowspan=rowspan, 
                  padx=5, pady=5, sticky='nsew')
        
        effects_container = tk.Frame(panel, bg='#1a1a1a')
        effects_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Configure grid for 4 effects
        for i in range(4):
            effects_container.grid_rowconfigure(i, weight=1)
        effects_container.grid_columnconfigure(0, weight=1)
        
        effects_gen = [
            ("NEURAL WAVES", 1),
            ("CHLADNI PATTERNS", 2), 
            ("BURST MATRIX", 3),
            ("QUANTUM FIELD", 4)
        ]
        
        for i, (name, value) in enumerate(effects_gen):
            btn = tk.Radiobutton(effects_container, text=name, variable=self.current_effect, 
                               value=value, command=self.on_effect_change,
                               font=('Orbitron', 10, 'bold'), bg='#2a2a2a', fg='#00ff00',
                               selectcolor='#444444', activebackground='#3a3a3a',
                               indicatoron=0, width=18, height=2,
                               relief=tk.RAISED, bd=2)
            btn.grid(row=i, column=0, padx=3, pady=3, sticky='nsew')
            
    def create_camera_panel(self, parent, row, col, colspan, rowspan):
        panel = self.create_panel_frame(parent, "CAMERA REACTIVE", '#ff6600')
        panel.grid(row=row, column=col, columnspan=colspan, rowspan=rowspan, 
                  padx=5, pady=5, sticky='nsew')
        
        effects_container = tk.Frame(panel, bg='#1a1a1a')
        effects_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Configure grid for 3 effects
        for i in range(3):
            effects_container.grid_rowconfigure(i, weight=1)
        effects_container.grid_columnconfigure(0, weight=1)
        
        effects_cam = [
            ("CAMERA DISTORT", 5),
            ("DEPTH SCANNER", 6),
            ("FACE MORPH", 7)
        ]
        
        for i, (name, value) in enumerate(effects_cam):
            btn = tk.Radiobutton(effects_container, text=name, variable=self.current_effect, 
                               value=value, command=self.on_effect_change,
                               font=('Orbitron', 10, 'bold'), bg='#2a2a2a', fg='#ff6600',
                               selectcolor='#444444', activebackground='#3a3a3a',
                               indicatoron=0, width=18, height=2,
                               relief=tk.RAISED, bd=2)
            btn.grid(row=i, column=0, padx=3, pady=3, sticky='nsew')
            
    def create_audio_panel(self, parent, row, col, colspan, rowspan):
        panel = self.create_panel_frame(parent, "AUDIO MATRIX", '#ff8000')
        panel.grid(row=row, column=col, columnspan=colspan, rowspan=rowspan, 
                  padx=5, pady=5, sticky='nsew')
        
        # Music buttons
        music_buttons = tk.Frame(panel, bg='#1a1a1a')
        music_buttons.pack(pady=10)
        
        tk.Button(music_buttons, text="PLAY", command=lambda: self.music_control('play'),
                 font=('Orbitron', 10, 'bold'), bg='#003300', fg='#00ff00',
                 activebackground='#006600', width=8, height=2).pack(side=tk.TOP, pady=2)
        
        tk.Button(music_buttons, text="PAUSE", command=lambda: self.music_control('pause'),
                 font=('Orbitron', 10, 'bold'), bg='#330000', fg='#ff6600',
                 activebackground='#660000', width=8, height=2).pack(side=tk.TOP, pady=2)
        
        # Volume control
        self.create_rotary_control(panel, "VOLUME", self.volume, 0, 100, size=80)
        
    def create_rgb_panel(self, parent, row, col, colspan, rowspan):
        panel = self.create_panel_frame(parent, "RGB MATRIX", '#ff00ff')
        panel.grid(row=row, column=col, columnspan=colspan, rowspan=rowspan, 
                  padx=5, pady=5, sticky='nsew')
        
        # RGB Selector with LEDs
        rgb_selector = tk.Frame(panel, bg='#1a1a1a')
        rgb_selector.pack(pady=10)
        
        # R, G, B buttons with LEDs in horizontal layout
        for color, var_name, color_code in [('R', 'r', '#ff0000'), ('G', 'g', '#00ff00'), ('B', 'b', '#0066ff')]:
            btn_frame = tk.Frame(rgb_selector, bg='#1a1a1a')
            btn_frame.pack(side=tk.LEFT, padx=8)
            
            # LED
            led = tk.Canvas(btn_frame, width=16, height=16, bg='#1a1a1a', highlightthickness=0)
            led.pack()
            setattr(self, f'{var_name}_led', led)
            
            # Button
            tk.Radiobutton(btn_frame, text=color, variable=self.rgb_active, value=var_name,
                          command=self.update_rgb_leds, font=('Orbitron', 10, 'bold'),
                          bg='#1a1a1a', fg=color_code, selectcolor='#333333',
                          indicatoron=0, width=3).pack()
        
        # RGB Rotary Control - special handling for dynamic updates
        self.create_rgb_rotary_control(panel)
        
    def create_control_panel(self, parent, row, col, colspan, rowspan):
        panel = self.create_panel_frame(parent, "SYSTEM CONTROL", '#ffff00')
        panel.grid(row=row, column=col, columnspan=colspan, rowspan=rowspan, 
                  padx=5, pady=5, sticky='nsew')
        
        # Speed and Intensity controls
        self.create_rotary_control(panel, "SPEED", self.speed, 0.1, 10.0, size=70)
        self.create_rotary_control(panel, "INTENSITY", self.intensity, 0.1, 10.0, size=70)
        
    def create_status_panel(self, parent, row, col, colspan, rowspan):
        panel = self.create_panel_frame(parent, "SYSTEM STATUS", '#00ffff')
        panel.grid(row=row, column=col, columnspan=colspan, rowspan=rowspan, 
                  padx=5, pady=5, sticky='nsew')
        
        # Status display - multiple labels for different info
        self.status_title = tk.Label(panel, text="◢ REMOTE MODE ◣", 
                              font=('Orbitron', 10, 'bold'), bg='#1a1a1a', fg='#00ffff')
        self.status_title.pack(pady=2)
        
        self.status_effect = tk.Label(panel, text="Effect: - ", 
                              font=('Orbitron', 8), bg='#1a1a1a', fg='#00ff00')
        self.status_effect.pack()
        
        self.status_shader = tk.Label(panel, text="Shader: - ", 
                              font=('Orbitron', 8), bg='#1a1a1a', fg='#ffff00')
        self.status_shader.pack()
        
        self.status_camera = tk.Label(panel, text="Camera: INACTIVE", 
                              font=('Orbitron', 8), bg='#1a1a1a', fg='#ff0000')
        self.status_camera.pack()
        
        self.status_audio = tk.Label(panel, text="Audio: READY", 
                              font=('Orbitron', 8), bg='#1a1a1a', fg='#ff00ff')
        self.status_audio.pack()
        
        # Connection indicator
        self.connection_led = tk.Canvas(panel, width=20, height=20, bg='#1a1a1a', highlightthickness=0)
        self.connection_led.pack(pady=5)
        self.connection_led.create_oval(2, 2, 18, 18, fill='#ff0000', outline='#ffffff')
        
        self.conn_label = tk.Label(panel, text="DISCONNECTED", font=('Orbitron', 8),
                                  bg='#1a1a1a', fg='#ff0000')
        self.conn_label.pack()
        
        # Initialize LEDs
        self.update_rgb_leds()
        
    def create_rotary_control(self, parent, label, variable, min_val, max_val, size=100):
        frame = tk.Frame(parent, bg='#1a1a1a')
        frame.pack(pady=5)
        
        # Label
        tk.Label(frame, text=label, font=('Orbitron', 9), 
                bg='#1a1a1a', fg='#ffffff').pack()
        
        # Rotary canvas
        canvas = tk.Canvas(frame, width=size, height=size, bg='#0a0a0a', highlightthickness=0)
        canvas.pack(pady=3)
        
        # Value label
        value_label = tk.Label(frame, text=f"{variable.get():.1f}", 
                              font=('Orbitron', 10, 'bold'),
                              bg='#1a1a1a', fg='#00ffff')
        value_label.pack()
        
        def draw_rotary():
            canvas.delete("all")
            center = size // 2
            radius = center - 10
            
            # Outer circle
            canvas.create_oval(center-radius, center-radius, center+radius, center+radius, 
                             outline='#333333', width=2)
            # Inner circle
            canvas.create_oval(center-radius+10, center-radius+10, center+radius-10, center+radius-10, 
                             outline='#666666', width=1)
            
            # Calculate angle
            val_range = max_val - min_val
            val_norm = (variable.get() - min_val) / val_range
            angle = val_norm * 270 - 135
            rad = math.radians(angle)
            
            # Indicator line
            end_x = center + (radius-15) * math.cos(rad)
            end_y = center + (radius-15) * math.sin(rad)
            canvas.create_line(center, center, end_x, end_y, fill='#00ffff', width=3)
            
            # Center dot
            canvas.create_oval(center-3, center-3, center+3, center+3, fill='#00ffff', outline='#ffffff')
            
            if label == "RGB VALUE":
                value_label.config(text=f"{int(variable.get())}")
            else:
                value_label.config(text=f"{variable.get():.1f}")
            
        def on_click(event):
            if not self.connected:
                return
            center = size // 2
            dx = event.x - center
            dy = event.y - center
            angle = math.degrees(math.atan2(dy, dx))
            
            if angle < -135:
                angle += 360
            angle = max(-135, min(135, angle))
            
            val_norm = (angle + 135) / 270
            new_val = min_val + val_norm * (max_val - min_val)
            if label == "RGB VALUE":
                variable.set(int(new_val))
            else:
                variable.set(round(new_val, 1))
            
            draw_rotary()
            self.write_control_file()
            
        canvas.bind("<Button-1>", on_click)
        canvas.bind("<B1-Motion>", on_click)
        
        draw_rotary()
        
    def get_active_rgb_var(self):
        active = self.rgb_active.get()
        return {'r': self.rgb_r, 'g': self.rgb_g, 'b': self.rgb_b}[active]
            
    def update_rgb_leds(self):
        active = self.rgb_active.get()
        
        for color, led_name in [('r', 'r_led'), ('g', 'g_led'), ('b', 'b_led')]:
            led = getattr(self, led_name)
            led.delete("all")
            
            if color == active:
                fill_color = {'r': '#ff0000', 'g': '#00ff00', 'b': '#0066ff'}[color]
            else:
                fill_color = {'r': '#330000', 'g': '#003300', 'b': '#000033'}[color]
                
            led.create_oval(2, 2, 14, 14, fill=fill_color, outline='#666666')
        
        # Update RGB rotary control to reflect current active component
        self.update_rgb_rotary()
        if self.connected:
            self.write_control_file()
        
    def create_rgb_rotary_control(self, parent):
        frame = tk.Frame(parent, bg='#1a1a1a')
        frame.pack(pady=5)
        
        # Label
        tk.Label(frame, text="RGB VALUE", font=('Orbitron', 9), 
                bg='#1a1a1a', fg='#ffffff').pack()
        
        # Rotary canvas
        self.rgb_canvas = tk.Canvas(frame, width=80, height=80, bg='#0a0a0a', highlightthickness=0)
        self.rgb_canvas.pack(pady=3)
        
        # Value label
        self.rgb_value_label = tk.Label(frame, text="255", 
                              font=('Orbitron', 10, 'bold'),
                              bg='#1a1a1a', fg='#00ffff')
        self.rgb_value_label.pack()
        
        def on_click(event):
            if not self.connected:
                return
            center = 40
            dx = event.x - center
            dy = event.y - center
            angle = math.degrees(math.atan2(dy, dx))
            
            if angle < -135:
                angle += 360
            angle = max(-135, min(135, angle))
            
            val_norm = (angle + 135) / 270
            new_val = int(val_norm * 255)
            
            # Update the active RGB component
            active = self.rgb_active.get()
            if active == 'r':
                self.rgb_r.set(new_val)
            elif active == 'g':
                self.rgb_g.set(new_val)
            else:
                self.rgb_b.set(new_val)
            
            self.draw_rgb_rotary()
            self.write_control_file()
            
        self.rgb_canvas.bind("<Button-1>", on_click)
        self.rgb_canvas.bind("<B1-Motion>", on_click)
        
        self.draw_rgb_rotary()
        
    def draw_rgb_rotary(self):
        canvas = self.rgb_canvas
        canvas.delete("all")
        center = 40
        radius = 30
        
        # Get current active RGB value
        active = self.rgb_active.get()
        current_val = {'r': self.rgb_r.get(), 'g': self.rgb_g.get(), 'b': self.rgb_b.get()}[active]
        
        # Outer circle
        canvas.create_oval(center-radius, center-radius, center+radius, center+radius, 
                         outline='#333333', width=2)
        # Inner circle
        canvas.create_oval(center-radius+10, center-radius+10, center+radius-10, center+radius-10, 
                         outline='#666666', width=1)
        
        # Calculate angle based on current value
        val_norm = current_val / 255.0
        angle = val_norm * 270 - 135
        rad = math.radians(angle)
        
        # Indicator line with active color
        end_x = center + (radius-15) * math.cos(rad)
        end_y = center + (radius-15) * math.sin(rad)
        line_color = {'r': '#ff0000', 'g': '#00ff00', 'b': '#0066ff'}[active]
        canvas.create_line(center, center, end_x, end_y, fill=line_color, width=3)
        
        # Center dot
        canvas.create_oval(center-3, center-3, center+3, center+3, fill=line_color, outline='#ffffff')
        
        # Update value label
        self.rgb_value_label.config(text=f"{current_val}")
        
    def update_rgb_rotary(self):
        # Redraw the RGB rotary to reflect the new active component
        self.draw_rgb_rotary()
        
    def connect_ssh(self):
        self.ssh_host = self.ip_entry.get()
        password = self.pass_entry.get()
        
        if not password:
            self.conn_status.config(text="ENTER PASSWORD", fg='#ff6600')
            return
            
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh_client.connect(self.ssh_host, username=self.ssh_user, password=password, timeout=10)
            
            self.connected = True
            self.conn_status.config(text="CONNECTED", fg='#00ff00')
            self.connect_btn.config(text="DISCONNECT", command=self.disconnect_ssh, bg='#330000', fg='#ff6600')
            
            # Update status panel
            self.status_title.config(text="◢ REMOTE ACTIVE ◣")
            self.update_status_info()
            self.connection_led.delete("all")
            self.connection_led.create_oval(2, 2, 18, 18, fill='#00ff00', outline='#ffffff')
            self.conn_label.config(text="CONNECTED", fg='#00ff00')
            
        except Exception as e:
            self.conn_status.config(text=f"ERROR: {str(e)[:10]}", fg='#ff0000')
            
    def disconnect_ssh(self):
        if self.ssh_client:
            self.ssh_client.close()
        self.connected = False
        self.conn_status.config(text="DISCONNECTED", fg='#ff0000')
        self.connect_btn.config(text="CONNECT", command=self.connect_ssh, bg='#003300', fg='#00ff00')
        
        # Update status panel
        self.status_title.config(text="◢ REMOTE MODE ◣")
        self.status_effect.config(text="Effect: - ")
        self.status_shader.config(text="Shader: - ")
        self.status_camera.config(text="Camera: INACTIVE", fg='#ff0000')
        self.status_audio.config(text="Audio: DISCONNECTED", fg='#ff0000')
        self.connection_led.delete("all")
        self.connection_led.create_oval(2, 2, 18, 18, fill='#ff0000', outline='#ffffff')
        self.conn_label.config(text="DISCONNECTED", fg='#ff0000')
        
    def on_effect_change(self):
        if not self.connected:
            return
        self.update_status_info()
        self.write_control_file()
        
    def music_control(self, action):
        if not self.connected:
            return
        self.status_audio.config(text=f"Audio: {action.upper()}")
        self.write_control_file(action)
        
    def write_control_file(self, music_action=None):
        if not self.connected:
            return
            
        try:
            content = f"""effect:{self.current_effect.get()}
rgb_r:{self.rgb_r.get()}
rgb_g:{self.rgb_g.get()}
rgb_b:{self.rgb_b.get()}
speed:{self.speed.get():.1f}
intensity:{self.intensity.get():.1f}
volume:{self.volume.get():.0f}"""
            
            if music_action:
                content += f"\nmusic:{music_action}"
                
            # Write to remote file via SSH
            command = f'mkdir -p $(dirname {self.control_file}) && echo "{content}" > {self.control_file}'
            stdin, stdout, stderr = self.ssh_client.exec_command(command)
            
        except Exception as e:
            self.conn_status.config(text="WRITE ERROR", fg='#ff0000')
            
    def update_status_info(self):
        if not self.connected:
            return
            
        effect = self.current_effect.get()
        effect_names = {
            1: "NEURAL WAVES",
            2: "CHLADNI PATTERNS", 
            3: "BURST MATRIX",
            4: "QUANTUM FIELD",
            5: "CAMERA DISTORT",
            6: "DEPTH SCANNER",
            7: "FACE MORPH"
        }
        
        effect_name = effect_names.get(effect, "UNKNOWN")
        self.status_effect.config(text=f"Effect: {effect} - {effect_name}")
        
        # Map effect to shader
        if effect <= 4:
            shader = effect
        elif effect == 5:
            shader = 5
        else:
            shader = 1
            
        self.status_shader.config(text=f"Shader: {shader}")
        
        # Camera status based on effect
        if effect in [5, 6, 7]:
            self.status_camera.config(text="Camera: ACTIVE", fg='#00ff00')
        else:
            self.status_camera.config(text="Camera: INACTIVE", fg='#ff0000')
            
        # Audio status
        self.status_audio.config(text="Audio: ACTIVE", fg='#00ff00')
            
    def run(self):
        # Configure window close behavior to shutdown entire system
        self.root.protocol("WM_DELETE_WINDOW", self.shutdown_system)
        self.root.mainloop()
        
    def shutdown_system(self):
        # Shutdown entire LUMIUS system when control panel is closed
        try:
            if self.connected:
                # Kill visualizer process on remote
                self.ssh_client.exec_command("pkill -f openframeworks-visualizer")
                
                # Write shutdown signal
                self.ssh_client.exec_command(f'echo "system:shutdown" > {self.control_file}')
                
        except Exception as e:
            pass
            
        # Close control panel
        self.root.quit()
        self.root.destroy()

if __name__ == "__main__":
    try:
        import paramiko
    except ImportError:
        print("Install paramiko: pip install paramiko")
        exit(1)
        
    controller = LumiusControlPanel()
    controller.run()