@echo off
setlocal
title Eagles Club - Assistant de Lancement COMPLET
color 0B

echo ======================================================
echo    SYSTEME DE GESTION EAGLES CLUB - DEMARRAGE COMPLET
echo ======================================================

set PKG_MGR=npm
if exist "pnpm-lock.yaml" set PKG_MGR=pnpm

echo.
echo [DEBUG] Utilisation de : %PKG_MGR%

:DOCKER
echo.
echo [0/4] Verification de la Base de Donnees (Docker)...
call docker compose up postgres -d
if errorlevel 1 (
    echo [ATTENTION] Docker ne semble pas etre lance.
    echo Assurez-vous d'avoir Docker Desktop ouvert.
    echo.
    set /p CONTINUE="Voulez-vous continuer sans Docker ? (y/n) : "
    if /i not "%CONTINUE%"=="y" exit /b
) else (
    echo      Base de donnees Postgres lancee avec succes.
)

:CLEANUP
echo.
if not exist ".next" goto DEPS
echo [1/4] Nettoyage du dossier de build (.next)...
rmdir /s /q ".next"
echo      Dossier .next supprime.

:DEPS
echo.
if exist "node_modules" goto PRISMA
echo [2/4] Installation des dependances Frontend...
call %PKG_MGR% install

:PRISMA
echo.
if not exist "backend\prisma" goto LAUNCH
echo [3/4] Mise a jour de Prisma (Backend)...
pushd backend
if not exist "node_modules" (
    echo      Installation des dependances Backend...
    call %PKG_MGR% install
)
echo      Generation du client Prisma...
if "%PKG_MGR%"=="pnpm" (
    call pnpm exec prisma generate
) else (
    call npx prisma generate
)
popd

:LAUNCH
echo.
echo ======================================================
echo [4/4] Lancement des SERVEURS...
echo.
echo Frontend : http://localhost:3000
echo Backend  : http://localhost:3001
echo ======================================================
echo.

:: Lancement du backend dans une NOUVELLE fenetre
echo Lancement du Backend (Port 3001)...
start "Backend - Eagles Club" cmd /k "cd backend && call %PKG_MGR% run start:dev"

:: Lancement du frontend dans cette fenetre
echo Lancement du Frontend (Port 3000)...
call %PKG_MGR% run dev

pause
