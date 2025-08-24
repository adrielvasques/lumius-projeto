/**
 * HSV Encoder Controller for Raspberry Pi Pico
 * 100 PPR Encoder with exclusive button selection
 */

#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/pio.h"
#include "hardware/timer.h"
#include "hardware/gpio.h"

#include "quadrature_encoder.pio.h"

// HSV Controller for 100 PPR Encoder
// H: 0-360 degrees, S: 0-100%, V: 0-100%
// Only one property can be selected at a time

typedef struct {
    float hue;        // 0-360 degrees
    float saturation; // 0-100 percent
    float value;      // 0-100 percent (brightness)
} hsv_t;

int main() {
    hsv_t hsv = {0.0, 100.0, 50.0};
    int delta, old_encoder = 0;
    float last_hue = -1, last_sat = -1, last_val = -1;
    int last_mode = -1;
    
    const uint PIN_AB = 20;
    const uint BT_HUE = 13;        // RED - Hue control
    const uint BT_SATURATION = 12; // GREEN - Saturation control  
    const uint BT_VALUE = 11;      // YELLOW - Value control

    stdio_init_all();
    printf("HSV Controller Ready\n");

    gpio_init(BT_HUE);
    gpio_set_dir(BT_HUE, GPIO_IN);
    gpio_pull_down(BT_HUE);
    
    gpio_init(BT_SATURATION);
    gpio_set_dir(BT_SATURATION, GPIO_IN);
    gpio_pull_down(BT_SATURATION);
    
    gpio_init(BT_VALUE);
    gpio_set_dir(BT_VALUE, GPIO_IN);
    gpio_pull_down(BT_VALUE);

    PIO pio = pio0;
    const uint sm = 0;
    pio_add_program(pio, &quadrature_encoder_program);
    quadrature_encoder_program_init(pio, sm, PIN_AB, 0);

    while (1) {
        bool hue_btn = gpio_get(BT_HUE);
        bool sat_btn = gpio_get(BT_SATURATION);
        bool val_btn = gpio_get(BT_VALUE);
        
        int active_count = hue_btn + sat_btn + val_btn;
        int current_mode = -1;
        
        // Determine current mode
        if (active_count == 1) {
            if (hue_btn) current_mode = 0;
            else if (sat_btn) current_mode = 1;
            else if (val_btn) current_mode = 2;
        } else if (active_count == 0) {
            current_mode = -1; // DISABLE
        } else {
            current_mode = last_mode; // Keep previous mode when multiple buttons
        }
        
        // Process encoder only when exactly one button is active
        if (active_count == 1) {
            int raw_encoder = quadrature_encoder_get_count(pio, sm);
            delta = raw_encoder - old_encoder;
            old_encoder = raw_encoder;
            
            if (delta != 0) {
                switch (current_mode) {
                    case 0: // Hue: 0.1° per step
                        hsv.hue += delta * 0.1;
                        if (hsv.hue < 0) hsv.hue = 0;
                        if (hsv.hue > 360) hsv.hue = 360;
                        break;
                    case 1: // Saturation: 0.1% per step
                        hsv.saturation += delta * 0.1;
                        if (hsv.saturation < 0) hsv.saturation = 0;
                        if (hsv.saturation > 100) hsv.saturation = 100;
                        break;
                    case 2: // Value: 0.1% per step
                        hsv.value += delta * 0.1;
                        if (hsv.value < 0) hsv.value = 0;
                        if (hsv.value > 100) hsv.value = 100;
                        break;
                }
            }
        }
        
        // Output when values or mode changes
        if (hsv.hue != last_hue || hsv.saturation != last_sat || hsv.value != last_val || current_mode != last_mode) {
            printf("Hue: %.1f\n", hsv.hue);
            printf("S: %.1f\n", hsv.saturation);
            printf("V: %.1f\n", hsv.value);
            
            if (current_mode >= 0) {
                const char* modes[] = {"HUE", "SAT", "VAL"};
                printf("Mode: %s\n", modes[current_mode]);
            } else {
                printf("Mode: DISABLE\n");
            }
            printf("---\n");
            
            last_hue = hsv.hue;
            last_sat = hsv.saturation;
            last_val = hsv.value;
            last_mode = current_mode;
        }
        
        sleep_ms(50);
    }
}