#pragma once

#ifndef NODESHARED_MEMORY_HPP
#define NODESHARED_MEMORY_HPP

#include <napi.h>
#include "concurrent_hash_map.hpp"

class NodeSharedMemory : public Napi::ObjectWrap<NodeSharedMemory> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    NodeSharedMemory(const Napi::CallbackInfo& info);

    Napi::Value Add(const Napi::CallbackInfo& info);
    Napi::Value Get(const Napi::CallbackInfo& info);
    Napi::Value Remove(const Napi::CallbackInfo& info);

private:
    static Napi::FunctionReference constructor;
    ConcurrentHashMap<std::string, Napi::ObjectReference> sharedMemoryMap; // ConcurrentHashMap for shared memory
};

#endif // NODESHARED_MEMORY_HPP
