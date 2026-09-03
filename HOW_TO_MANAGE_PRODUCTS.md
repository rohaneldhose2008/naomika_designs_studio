# How to Add & Manage Products in Naomika Design Studio

Follow these 3 simple steps to add new boutique designs, update prices, or change photos:

---

### Step 1: Add New Product Photos
1. Take high-resolution photos of your boutique outfits from your phone or camera.
2. Drop the photo files into the **`raw_images`** folder (or **`images`** folder).
   - *Example filenames: `kerala_saree_gold.jpg`, `black_bandhgala.png`*

---

### Step 2: Edit `products.xlsx` Spreadsheet
1. Open **`products.xlsx`** in Microsoft Excel.
2. Add a new row at the bottom with your outfit details:
   - **Product Code**: e.g., `NDS-LW-130`, `NDS-MW-220`, or leave blank to auto-generate.
   - **Product Name**: e.g., `Royal Kanchipuram Gold Drape`
   - **Category**: Select or type `Ladies Wear`, `Mens Wear`, or `Customization`
   - **Subcategory**: e.g., `Sarees`, `Lehengas`, `Kurtis`, `Gowns`, `Suits & Blazers`, `Sherwanis`, `Kurtas`, `Bespoke Couture`
   - **Price**: Selling price in Rupees (e.g., `12500` or leave blank for Bespoke items)
   - **Original Price**: Price before discount (e.g., `15000`)
   - **Image 1**: Exact image filename from Step 1 (e.g., `kerala_saree_gold.jpg`)
   - **Image 2**: Optional second photo/angle
   - **Stock Status**: `In Stock`, `Limited Stock`, or `Made to Order`
   - **Badge**: `Fresh Arrivals`, `Haute Couture`, `Bespoke Cut`, or `Trending`
   - **Description**: Fabric details, craftsmanship, embroidery, styling recommendations.
   - **Featured**: `Yes` or `No` (Featured items appear on Home Page highlights)
3. Save and close `products.xlsx`.

---

### Step 3: Double-Click `update_store.bat`
1. Double-click **`update_store.bat`**.
2. It automatically:
   - Copies images into the website catalog.
   - Re-generates `data/products.json` and `data/products.js`.
   - Previews the total count of active catalog products.
3. Refresh your browser at `http://localhost:3000` to see your new creations live!
