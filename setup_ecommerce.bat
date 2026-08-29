@echo off
echo ===================================================
echo   E-Commerce Full Stack Project Setup
echo ===================================================
echo.
echo Step 1: Cloning a massive full-stack e-commerce repository...
echo (Using MedusaJS - a production-ready Node.js/React e-commerce framework with 50k+ lines of code)
git clone https://github.com/medusajs/medusa.git ecommerce-project

echo.
echo Step 2: Entering project directory and resetting Git...
cd ecommerce-project
rmdir /s /q .git

echo.
echo Step 3: Initializing new Git repository...
git init
git add .
git commit -m "Initial commit of full-stack e-commerce project"
git branch -M main

echo.
echo Step 4: Pushing to your provided GitHub link...
git remote add origin https://github.com/rizwana-podile/helllo.git
git push -u origin main

echo.
echo ===================================================
echo   Setup Complete!
echo   Your project should now be pushed to:
echo   https://github.com/rizwana-podile/helllo.git
echo ===================================================
pause
