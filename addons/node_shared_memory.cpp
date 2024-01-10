#include "node_shared_memory.hpp"

Napi::FunctionReference NodeSharedMemory::constructor;

NodeSharedMemory::NodeSharedMemory(const Napi::CallbackInfo& info)
  : Napi::ObjectWrap<NodeSharedMemory>(info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    sharedMemoryMap.reserve(100);
}

Napi::Value NodeSharedMemory::Add(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 2 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Key must be a string").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string key = info[0].As<Napi::String>().Utf8Value();
    Napi::Value value = info[1];

    // Add to ConcurrentHashMap
    sharedMemoryMap.insert(key, Napi::Persistent(value));

    return Napi::Value();
}

Napi::Value NodeSharedMemory::Get(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Key must be a string").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string key = info[0].As<Napi::String>().Utf8Value();

    // Retrieve the value from the ConcurrentHashMap
    // Assuming the stored value is also a string for simplicity
    auto value = sharedMemoryMap.get_copy_or_default(key, std::string(""));
    return Napi::String::New(env, value);
}

Napi::Value NodeSharedMemory::Remove(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Key must be a string").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string key = info[0].As<Napi::String>().Utf8Value();
    sharedMemoryMap.erase(key);

    return Napi::Value();
}

// ... remaining class implementation ...

Napi::Object NodeSharedMemory::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "NodeSharedMemory", {
        NodeSharedMemory::InstanceMethod("add", &NodeSharedMemory::Add),
        InstanceMethod("get", &NodeSharedMemory::Get),
        InstanceMethod("remove", &NodeSharedMemory::Remove),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("NodeSharedMemory", func);
    return exports;
}
