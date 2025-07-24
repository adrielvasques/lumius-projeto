cmake_minimum_required(VERSION 3.13)

# Pull in Pico SDK (must be before project)
include(${CMAKE_CURRENT_LIST_DIR}/pico_sdk_import.cmake)

project(pio_quadrature_encoder C CXX ASM)

# Initialize the Pico SDK
pico_sdk_init()

add_executable(pio_quadrature_encoder)

pico_generate_pio_header(pio_quadrature_encoder ${CMAKE_CURRENT_LIST_DIR}/quadrature_encoder.pio)

target_sources(pio_quadrature_encoder PRIVATE quadrature_encoder.c)

target_link_libraries(pio_quadrature_encoder PRIVATE
        pico_stdlib
        pico_multicore
        hardware_pio
        )

pico_enable_stdio_usb(pio_quadrature_encoder 1)

pico_add_extra_outputs(pio_quadrature_encoder)

# Set URL directly without using the helper macro
pico_set_program_url(pio_quadrature_encoder "https://github.com/raspberrypi/pico-examples/tree/HEAD/pio/quadrature_encoder")