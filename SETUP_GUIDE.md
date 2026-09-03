# Naomika Design Studio - Setup & Multi-Device Guide

This guide explains how to run, preview, and update **Naomika Design Studio** on any Windows 10/11 laptop using 3 simple batch files.

---

## 1. Initial 1-Click Package Setup (`install_packages.bat`)
When opening this project on a fresh laptop for the first time:
1. Double-click **`install_packages.bat`**.
2. It automatically verifies Node.js and installs the required packages (`xlsx`, `express`, `cors`).

---

## 2. Running Localhost (`run_localhost.bat`)
1. Double-click **`run_localhost.bat`**:
   - It automatically boots the fast static & admin server on port 3000.
   - It opens `http://localhost:3000` in your default browser.
   - You can browse the Home Page, Ladies Wear, Mens Wear, Customization Studio, and Admin Panel.

---

## 3. Updating Catalog from Excel (`update_store.bat`)
1. Edit `products.xlsx` in Excel (add products or change prices).
2. Double-click **`update_store.bat`**.
3. It compiles the catalog immediately for instant live browsing.

---

## 4. Local Admin Panel (`http://localhost:3000/admin`)
- Open `http://localhost:3000/admin` while `run_localhost.bat` is running.
- View live stock, search by Product Code, filter by Category, inspect images, and verify prices.
