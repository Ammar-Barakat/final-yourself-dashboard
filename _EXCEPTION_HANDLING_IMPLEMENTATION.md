# Custom Exception Handling Implementation

## Overview
This document describes the custom exception handling implementation applied to the **Manage** controllers and repositories in the yourself-demoAPI project.

## Architecture

### 1. Custom Exception Classes
Location: `yourself-demoAPI/Data/Helpers/CustomExceptions.cs`

The following custom exception types are available:

| Exception | Status Code | Use Case |
|-----------|-------------|----------|
| `NotFoundException` | 404 | When a resource doesn't exist |
| `BadRequestException` | 400 | When request data is invalid |
| `ValidationException` | 422 | When validation fails |
| `ConflictException` | 409 | When there's a conflict (e.g., duplicate) |
| `UnauthorizedException` | 401 | When authentication fails |
| `ForbiddenException` | 403 | When user lacks permissions |
| `InternalServerException` | 500 | When an unexpected error occurs |

All custom exceptions inherit from `ApiException`, which extends `Exception` and includes a `StatusCode` property.

### 2. Exception Handling Middleware
Location: `yourself-demoAPI/Middleware/ExceptionHandlingMiddleware.cs`

The middleware:
- Intercepts all exceptions thrown in the application
- Maps custom exceptions to appropriate HTTP status codes
- Logs all exceptions with the logger
- Returns consistent JSON error responses with:
  - `statusCode`: The HTTP status code
  - `message`: The error message
  - `timestamp`: When the error occurred

The middleware is registered in `Program.cs`:
```csharp
app.UseMiddleware<ExceptionHandlingMiddleware>();
```

### 3. Repository Updates

All **Manage** repositories have been updated to throw specific custom exceptions instead of generic `Exception`:

#### Updated Repositories:
1. **ManageProductRepo** - Product management operations
2. **ManageCategory** - Category and category items management
3. **ManageSchoolRepo** - School and pack management
4. **ManageCollection** - Collection management
5. **ManageBanner** - Banner slides management
6. **ManageStudents** - Student pack management
7. **ManageDesign** - Design images management

#### Example Changes:

**Before:**
```csharp
if (product == null)
    throw new Exception("No product was found with the provided ID");
```

**After:**
```csharp
if (product == null)
    throw new NotFoundException($"No product was found with ID: {productId}");
```

### 4. Controller Simplification

All **Manage** controllers have been simplified by removing try-catch blocks:

#### Updated Controllers:
1. **ManageProductsController**
2. **ManageCategoryController**
3. **ManageSchoolsController**
4. **ManageCollectionController**
5. **ManageBannerController**
6. **ManageStudentsController**
7. **ManageDesignController**

#### Example Changes:

**Before:**
```csharp
[HttpGet("GetAllProducts")]
public async Task<IActionResult> GetAllProducts()
{
    try
    {
        var products = await _manageProduct.GetAllProducts();
        return Ok(products);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}
```

**After:**
```csharp
[HttpGet("GetAllProducts")]
public async Task<IActionResult> GetAllProducts()
{
    var products = await _manageProduct.GetAllProducts();
    return Ok(products);
}
```

## Benefits

1. **Clean Controllers**: No more repetitive try-catch blocks
2. **Consistent Error Responses**: All errors follow the same JSON structure
3. **Appropriate Status Codes**: Each exception type maps to the correct HTTP status code
4. **Better Separation of Concerns**: Business logic throws exceptions, middleware handles HTTP responses
5. **Centralized Logging**: All exceptions are logged in one place
6. **Type Safety**: Specific exception types make error handling explicit
7. **Better Error Messages**: More descriptive error messages with context

## Error Response Format

All errors now return a consistent JSON format:

```json
{
  "statusCode": 404,
  "message": "Product not found with ID: 123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Exception Usage Examples

### Repository Layer

```csharp
// Resource not found
if (product == null)
    throw new NotFoundException($"Product not found with ID: {productId}");

// Invalid request
if (request == null)
    throw new BadRequestException("Invalid product data");

// Validation error
if (string.IsNullOrWhiteSpace(request.Name))
    throw new ValidationException("Product name is required");

// Conflict (duplicate)
if (existingSchool != null)
    throw new ConflictException($"A school with the name '{request.Name}' already exists");

// Internal error
if (string.IsNullOrEmpty(imageUrl))
    throw new InternalServerException("Image upload failed");
```

### Controller Layer

Controllers are now simple and clean - just call the repository method:

```csharp
[HttpGet("GetProductById/{productId}")]
public async Task<IActionResult> GetProductById(int productId)
{
    var product = await _manageProduct.GetProductById(productId);
    return Ok(product);
}
```

The middleware automatically handles any exceptions and returns the appropriate status code.

## Testing the Implementation

1. **404 Not Found**: Try to get a product with an invalid ID
   - Endpoint: `GET /api/ManageProducts/GetProductById/99999`
   - Expected: 404 status with error message

2. **400 Bad Request**: Submit invalid data
   - Endpoint: `POST /api/ManageProducts/AddProduct` with null body
   - Expected: 400 status with error message

3. **409 Conflict**: Try to add a duplicate school
   - Endpoint: `POST /api/ManageSchools/AddSchool` with existing name
   - Expected: 409 status with error message

4. **500 Internal Server Error**: If any unexpected error occurs
   - Expected: 500 status with generic error message

## Next Steps

To apply this pattern to the rest of the project:

1. Update remaining repositories (Profile, Students, Order, etc.)
2. Update remaining controllers
3. Consider adding more specific exception types if needed
4. Add integration tests for exception handling
5. Document API error responses in API documentation

## Notes

- The middleware is registered early in the pipeline to catch all exceptions
- All exceptions are logged for debugging and monitoring
- The implementation is backward compatible - existing code continues to work
- Future controllers and repositories should follow this pattern
