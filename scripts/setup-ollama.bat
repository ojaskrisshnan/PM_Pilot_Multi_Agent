@echo off
echo ========================================================
echo        PMPilot Local LLM Setup Script (Ollama)
echo ========================================================
echo.

where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Ollama is not installed or not found on PATH.
    echo Please download and install Ollama from: https://ollama.com
    echo After installing, rerun this setup script.
    pause
    exit /b 1
)

echo [OK] Ollama installation detected.
echo.
echo Pulling recommended local models for PMPilot...
echo.

echo 1/3 Pulling llama3.2 (Meta 3B model)...
ollama pull llama3.2

echo.
echo 2/3 Pulling qwen2.5-coder (Alibaba 7B coding model)...
ollama pull qwen2.5-coder

echo.
echo 3/3 Pulling deepseek-r1:1.5b (DeepSeek Reasoning model)...
ollama pull deepseek-r1:1.5b

echo.
echo ========================================================
echo SUCCESS: All local models downloaded!
echo Ensure Ollama is running ('ollama serve') before using Local LLM mode in PMPilot.
echo ========================================================
pause
