# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := node_shared_memory
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=node_shared_memory' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-D_GLIBCXX_USE_CXX11_ABI=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DBUILDING_NODE_EXTENSION' \
	'-DDEBUG' \
	'-D_DEBUG'

# Flags passed to all source files.
CFLAGS_Debug := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-fPIC \
	-std=c++11 \
	-fPIC \
	-D_GNU_SOURCE \
	-m64 \
	-g \
	-O0

# Flags passed to only C files.
CFLAGS_C_Debug :=

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++17

INCS_Debug := \
	-I/home/andres/.cache/node-gyp/21.5.0/include/node \
	-I/home/andres/.cache/node-gyp/21.5.0/src \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/openssl/config \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/openssl/openssl/include \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/uv/include \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/zlib \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/v8/include \
	-I$(srcdir)/.

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=node_shared_memory' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-D_GLIBCXX_USE_CXX11_ABI=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DBUILDING_NODE_EXTENSION'

# Flags passed to all source files.
CFLAGS_Release := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-fPIC \
	-std=c++11 \
	-fPIC \
	-D_GNU_SOURCE \
	-m64 \
	-O3 \
	-fno-omit-frame-pointer

# Flags passed to only C files.
CFLAGS_C_Release :=

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++17

INCS_Release := \
	-I/home/andres/.cache/node-gyp/21.5.0/include/node \
	-I/home/andres/.cache/node-gyp/21.5.0/src \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/openssl/config \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/openssl/openssl/include \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/uv/include \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/zlib \
	-I/home/andres/.cache/node-gyp/21.5.0/deps/v8/include \
	-I$(srcdir)/.

OBJS := \
	$(obj).target/$(TARGET)/addons/node_shared_memory.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-pthread \
	-rdynamic \
	-shared \
	-m64

LDFLAGS_Release := \
	-pthread \
	-rdynamic \
	-shared \
	-m64

LIBS := \
	-lrt

$(obj).target/node_shared_memory.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/node_shared_memory.node: LIBS := $(LIBS)
$(obj).target/node_shared_memory.node: TOOLSET := $(TOOLSET)
$(obj).target/node_shared_memory.node: $(OBJS) FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(obj).target/node_shared_memory.node
# Add target alias
.PHONY: node_shared_memory
node_shared_memory: $(builddir)/node_shared_memory.node

# Copy this to the executable output path.
$(builddir)/node_shared_memory.node: TOOLSET := $(TOOLSET)
$(builddir)/node_shared_memory.node: $(obj).target/node_shared_memory.node FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/node_shared_memory.node
# Short alias for building this executable.
.PHONY: node_shared_memory.node
node_shared_memory.node: $(obj).target/node_shared_memory.node $(builddir)/node_shared_memory.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/node_shared_memory.node

