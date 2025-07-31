#!/usr/bin/env python3
"""
Script de prueba para el endpoint directo de AiGO
"""
import requests
import json

# Configuración
BASE_URL = "http://localhost:8010"
HEADERS = {"Content-Type": "application/json"}

def test_complete_endpoint():
    """Prueba el endpoint completo"""
    print("🧪 Probando endpoint /direct/chat/complete")
    
    data = {
        "message": "Hola AiGO, necesito configurar una auditoría de llamadas",
        "full_name": "Manuel Araujo"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/direct/chat/complete", 
                               headers=HEADERS, 
                               json=data,
                               timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Respuesta exitosa:")
            print(f"📝 Contenido: {result.get('content', 'No content')}")
            print(f"🏁 Finish Reason: {result.get('finish_reason')}")
            print(f"🔧 Tool Calls: {result.get('tool_calls')}")
            print(f"📊 Function Data: {result.get('function_data')}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"💥 Error en la solicitud: {e}")

def test_streaming_endpoint():
    """Prueba el endpoint de streaming"""
    print("\n🧪 Probando endpoint /direct/chat (streaming)")
    
    data = {
        "message": "Cuál es el primer paso?",
        "full_name": "Manuel Araujo"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/direct/chat", 
                               headers=HEADERS, 
                               json=data,
                               stream=True,
                               timeout=30)
        
        if response.status_code == 200:
            print("✅ Streaming response:")
            print("📡 ", end="")
            for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
                if chunk:
                    print(chunk, end="", flush=True)
            print("\n")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"💥 Error en la solicitud: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas del AiGO Direct Chat API")
    print("=" * 50)
    
    # Test health first
    try:
        health = requests.get(f"{BASE_URL}/health", timeout=5)
        if health.status_code == 200:
            print("✅ Servidor funcionando correctamente")
        else:
            print("❌ Servidor no responde correctamente")
            exit(1)
    except Exception as e:
        print(f"💥 No se puede conectar al servidor: {e}")
        exit(1)
    
    # Run tests
    test_complete_endpoint()
    test_streaming_endpoint()
    
    print("\n🎉 Pruebas completadas!")
