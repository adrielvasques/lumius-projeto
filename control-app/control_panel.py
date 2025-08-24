#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk
import math
import os

class LumiusControlPanel:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("LUMIUS - VISUAL SYNTHESIS CONTROL")
        self.root.geometry("900x800")
        self.root.configure(bg='#0a0a0a')
        self.root.resizable(True, True)
        
        # Position control panel on the right side
        width = 700
        height = 800
        x = self.root.winfo_screenwidth() - width - 50
        y = 50
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        
        # Remove always on top to allow interaction with both windows
        self.root.lift()
        
        # Control file path
        self.control_file = "../openframeworks-visualizer/bin/data/control.txt"
        
        # Variables
        self.current_effect = tk.IntVar(value=1)
        self.rgb_r = tk.IntVar(value=255)
        self.rgb_g = tk.IntVar(value=255)
        self.rgb_b = tk.IntVar(value=255)
        self.rgb_active = tk.StringVar(value="r")
        self.speed = tk.DoubleVar(value=1.0)
        self.intensity = tk.DoubleVar(value=1.0)
        self.volume = tk.DoubleVar(value=50)
        
        self.setup_ui()
        
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
        self.create_rotary_control(panel, "SPEED", self.speed, 0.1, 5.0, size=70)
        self.create_rotary_control(panel, "INTENSITY", self.intensity, 0.1, 3.0, size=70)
        
    def create_status_panel(self, parent, row, col, colspan, rowspan):
        panel = self.create_panel_frame(parent, "SYSTEM STATUS", '#00ffff')
        panel.grid(row=row, column=col, columnspan=colspan, rowspan=rowspan, 
                  padx=5, pady=5, sticky='nsew')
        
        # Status display
        self.status = tk.Label(panel, text="◢ SYSTEM READY ◣\nLUMIUS ACTIVE", 
                              font=('Orbitron', 10, 'bold'), bg='#1a1a1a', fg='#00ffff',
                              justify=tk.CENTER)
        self.status.pack(expand=True)
        
        # Connection indicator
        self.connection_led = tk.Canvas(panel, width=20, height=20, bg='#1a1a1a', highlightthickness=0)
        self.connection_led.pack(pady=5)
        self.connection_led.create_oval(2, 2, 18, 18, fill='#00ff00', outline='#ffffff')
        
        tk.Label(panel, text="CONNECTED", font=('Orbitron', 8),
                bg='#1a1a1a', fg='#00ff00').pack()
        
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
        
    def on_effect_change(self):
        effect = self.current_effect.get()
        self.status.config(text=f"◢ EFFECT {effect} ACTIVE ◣\nLUMIUS PROCESSING")
        self.write_control_file()
        
    def music_control(self, action):
        self.status.config(text=f"◢ MUSIC {action.upper()} ◣\nLUMIUS AUDIO")
        self.write_control_file(action)
        
    def write_control_file(self, music_action=None):
        try:
            os.makedirs(os.path.dirname(self.control_file), exist_ok=True)
            
            with open(self.control_file, 'w') as f:
                f.write(f"effect:{self.current_effect.get()}\n")
                f.write(f"rgb_r:{self.rgb_r.get()}\n")
                f.write(f"rgb_g:{self.rgb_g.get()}\n")
                f.write(f"rgb_b:{self.rgb_b.get()}\n")
                f.write(f"speed:{self.speed.get():.1f}\n")
                f.write(f"intensity:{self.intensity.get():.1f}\n")
                f.write(f"volume:{self.volume.get():.0f}\n")
                if music_action:
                    f.write(f"music:{music_action}\n")
                
        except Exception as e:
            self.status.config(text=f"◢ ERROR ◣\n{str(e)[:20]}...", fg='#ff0000')
            
    def run(self):
        # Configure window close behavior to shutdown entire system
        self.root.protocol("WM_DELETE_WINDOW", self.shutdown_system)
        self.root.mainloop()
        
    def shutdown_system(self):
        # Shutdown entire LUMIUS system when control panel is closed
        try:
            # Kill visualizer process
            subprocess.run(["pkill", "-f", "openframeworks-visualizer"], check=False)
            
            # Kill any remaining processes
            subprocess.run(["pkill", "-f", "lumius"], check=False)
            
            # Write shutdown signal
            with open(self.control_file, 'w') as f:
                f.write("system:shutdown\n")
                
        except Exception as e:
            pass
            
        # Close control panel
        self.root.quit()
        self.root.destroy()

if __name__ == "__main__":
    controller = LumiusControlPanel()
    controller.run()