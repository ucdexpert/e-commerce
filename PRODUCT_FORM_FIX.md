# Product Form Category Selection - Bug Fix

## Problem
The multi-select dropdown for categories was causing form issues:
- Form would scroll back to category field when clicking options
- Form would reset/close unexpectedly
- Poor UX with native `<select multiple>`

## Solution
Replaced the native HTML `<select multiple>` with a custom checkbox-based category selector.

---

## Changes Made

### 1. Custom Category Checkbox Component

**Before:**
```tsx
<select
  {...register('category_ids')}
  multiple
  className="w-full px-3 py-2 border rounded-lg"
>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>
<p className="text-sm text-gray-500 mt-1">Hold Ctrl to select multiple</p>
```

**After:**
```tsx
<div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
  {categories.length === 0 ? (
    <p className="text-sm text-gray-500 text-center py-2">
      No categories available. Create categories first.
    </p>
  ) : (
    <div className="space-y-2">
      {categories.map((cat) => {
        const isSelected = watch('category_ids')?.includes(cat.id) || false;
        return (
          <label
            key={cat.id}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              value={cat.id}
              checked={isSelected}
              onChange={(e) => {
                const current = watch('category_ids') || [];
                if (e.target.checked) {
                  setValue('category_ids', [...current, cat.id]);
                } else {
                  setValue(
                    'category_ids',
                    current.filter((id) => id !== cat.id)
                  );
                }
              }}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">{cat.name}</span>
            {isSelected && (
              <Check className="w-4 h-4 text-green-600 ml-auto" />
            )}
          </label>
        );
      })}
    </div>
  )}
</div>
```

### 2. Selected Categories Tags Display

Added visual feedback showing selected categories as removable tags:

```tsx
{watch('category_ids') && watch('category_ids')!.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-2">
    {watch('category_ids')!.map((catId) => {
      const cat = categories.find((c) => c.id === catId);
      return cat ? (
        <span
          key={catId}
          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded"
        >
          {cat.name}
          <button
            type="button"
            onClick={() => {
              setValue(
                'category_ids',
                watch('category_ids')!.filter((id) => id !== catId)
              );
            }}
            className="hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ) : null;
    })}
  </div>
)}
```

### 3. Enhanced Form Submission Debugging

Added comprehensive logging to debug form submission:

```tsx
const onSubmit = async (data: ProductFormData) => {
  console.log('=== FORM DATA BEFORE SUBMIT ===');
  console.log('Form Data:', JSON.stringify(data, null, 2));
  console.log('Category IDs:', data.category_ids);
  console.log('Category IDs Type:', Array.isArray(data.category_ids) ? 'Array' : typeof data.category_ids);
  
  // Get token for verification
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  console.log('JWT Token exists:', !!token);
  console.log('Token prefix:', token ? token.substring(0, 20) + '...' : 'No token');
  
  try {
    // Ensure category_ids is an array of numbers
    const submitData = {
      ...data,
      category_ids: Array.isArray(data.category_ids) 
        ? data.category_ids.map(id => Number(id))
        : [],
    };
    
    console.log('=== DATA BEING SENT TO API ===');
    console.log(JSON.stringify(submitData, null, 2));
    
    if (editingProduct) {
      console.log('Updating product ID:', editingProduct.id);
      await api.put(`/products/${editingProduct.id}`, submitData);
    } else {
      console.log('Creating new product');
      await api.post('/products/', submitData);
    }
    // ... rest of the code
  } catch (error: any) {
    console.error('=== API ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.config?.headers);
    // ... error handling
  }
};
```

### 4. API Interceptor Logging

Added logging to verify Authorization header is being set:

```tsx
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Interceptor] Token added to:', config.url, 'Token:', token.substring(0, 20) + '...');
    } else {
      console.log('[API Interceptor] No token found for:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('[API Interceptor] Error:', error);
    return Promise.reject(error);
  }
);
```

---

## Features

### ✅ Visual Improvements
- **Checkbox List**: All categories displayed as checkboxes
- **Hover Effect**: Each row highlights on hover
- **Check Icon**: Green checkmark appears when selected
- **Selected Tags**: Selected categories shown as removable tags above the list
- **Scrollable**: Max height 48 with scroll for many categories
- **Empty State**: Shows message if no categories exist

### ✅ UX Improvements
- **No More Accidental Closes**: Clicking checkboxes doesn't trigger form submission
- **No Scrolling Issues**: Checkboxes don't cause form to scroll unexpectedly
- **Clear Selection**: Click X on tags to quickly deselect
- **Visual Feedback**: Selected categories clearly marked
- **Mobile Friendly**: Works great on touch devices

### ✅ Data Integrity
- **Array of Integers**: `category_ids` sent as `[1, 2, 3]` (integers)
- **Type Conversion**: Ensures all IDs are numbers before sending
- **Validation**: Requires at least one category (zod schema)
- **Debug Logging**: Full visibility into what's being sent

---

## How to Test

1. **Open Admin Products**: Navigate to `/admin/products`
2. **Click "Add Product"**: Opens the modal
3. **Fill Required Fields**: Name, Description, Price, Stock
4. **Select Categories**:
   - Click checkboxes to select categories
   - See checkmark appear on selected items
   - See tags appear below the list
   - Click X on tags to deselect
5. **Open Browser Console** (F12):
   - Click "Create Product"
   - Check logs for:
     ```
     === FORM DATA BEFORE SUBMIT ===
     Form Data: { ... }
     Category IDs: [1, 2]
     Category IDs Type: Array
     JWT Token exists: true
     Token prefix: eyJhbGciOiJIUzI1...
     === DATA BEING SENT TO API ===
     { "category_ids": [1, 2], ... }
     ```
6. **Verify API Request**:
   - Check Network tab
   - Look for POST to `/api/products/`
   - Verify Request Headers:
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1...
     Content-Type: application/json
     ```
   - Verify Payload:
     ```json
     {
       "name": "Test Product",
       "category_ids": [1, 2],
       "price": 99.99,
       ...
     }
     ```

---

## API Request Format

The form now sends data in this format:

```json
{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones...",
  "short_description": "Premium sound quality",
  "price": 2999,
  "compare_price": 3999,
  "sku": "WH-001",
  "stock_quantity": 50,
  "category_ids": [2, 5],  // ← Array of integers
  "images": ["url1.jpg", "url2.jpg"],
  "is_featured": true,
  "is_active": true,
  "is_on_sale": false
}
```

**Backend receives:**
```python
{
  "name": "Wireless Headphones",
  "category_ids": [2, 5],  # List[int]
  ...
}
```

---

## Files Modified

1. **frontend/src/app/admin/products/page.tsx**
   - Lines 616-697: Category selector component
   - Lines 215-262: Enhanced onSubmit with debugging

2. **frontend/src/lib/api.ts**
   - Lines 14-31: Enhanced interceptor with logging

---

## Troubleshooting

### Issue: Categories not saving
**Check:**
1. Browser console for form data logs
2. Network tab for API request payload
3. Verify `category_ids` is array: `Array.isArray(data.category_ids)`
4. Verify at least one category is selected (validation error shows)

### Issue: 401 Unauthorized
**Check:**
1. Browser console for "[API Interceptor] No token found"
2. localStorage has `access_token`
3. Token is valid (not expired)
4. Check Network tab → Headers → Authorization

### Issue: 400 Bad Request
**Check:**
1. Console logs show correct data format
2. `category_ids` contains valid category IDs that exist in database
3. All required fields are filled (name, description, price, stock, categories)

---

## Success Criteria

✅ User can select multiple categories with checkboxes  
✅ Selected categories display as removable tags  
✅ Form doesn't scroll or reset unexpectedly  
✅ Console logs show complete form data before submit  
✅ Console logs show JWT token is being attached  
✅ API receives `category_ids` as array of integers  
✅ Product saves successfully with categories  
✅ Error messages show if validation fails  

---

**Status: ✅ FIXED**
