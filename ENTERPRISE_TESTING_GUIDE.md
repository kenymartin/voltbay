# 🏭 Enterprise Quote System & ROI Simulator - Testing Guide

## ✅ **DEPLOYMENT STATUS: READY FOR TESTING**

The Enterprise Quote System and ROI Simulator are now fully deployed and operational with comprehensive test data.

---

## 👥 **TEST ACCOUNTS**

### 🏭 **ENTERPRISE VENDORS** (Can create listings and respond to quotes)

| Email | Password | Company | Name | Location |
|-------|----------|---------|------|----------|
| `vendor@terramont.com` | `password123` | TerraMount Solar Systems | David Chen | Austin, TX |
| `sales@sunpowerind.com` | `password123` | SunPower Industrial Solutions | Maria Rodriguez | Phoenix, AZ |
| `contact@greenenergy.com` | `password123` | Green Energy Solutions LLC | James Wilson | Denver, CO |

### 🏢 **ENTERPRISE CUSTOMERS** (Can request quotes and use ROI simulator)

| Email | Password | Company | Name | Location |
|-------|----------|---------|------|----------|
| `procurement@manufactureplus.com` | `password123` | ManufacturePlus Industries | Sarah Thompson | Detroit, MI |
| `facilities@techcorp.com` | `password123` | TechCorp Enterprises | Michael Johnson | San Jose, CA |
| `energy@logisticshub.com` | `password123` | LogisticsHub Distribution | Lisa Martinez | Memphis, TN |

---

## 🔧 **TESTING SCENARIOS**

### **1. Enterprise Vendor Workflow**

**Login as Vendor:** `vendor@terramont.com / password123`

✅ **What Vendors Can Do:**
- View and manage enterprise listings
- Respond to quote requests from customers
- Upload technical documents and proposals
- Communicate with customers via messaging system
- Set pricing and delivery terms
- Manage project specifications

**Test Steps:**
1. Login to the platform
2. Navigate to vendor dashboard
3. View existing enterprise listings
4. Check incoming quote requests
5. Respond to quote requests with pricing
6. Upload documents (PDFs, spec sheets)
7. Send messages to customers

### **2. Enterprise Customer Workflow**

**Login as Customer:** `procurement@manufactureplus.com / password123`

✅ **What Customers Can Do:**
- Browse enterprise listings
- Request quotes for industrial projects
- Use ROI simulator for investment analysis
- Compare vendor proposals
- Communicate with vendors
- Download technical documents

**Test Steps:**
1. Login to the platform
2. Browse enterprise listings
3. Request quotes for specific projects
4. Use ROI simulator with project parameters
5. Review vendor responses
6. Download vendor documents
7. Message vendors for clarification

### **3. ROI Simulator Testing**

**Available for all users (no login required for basic use)**

✅ **ROI Calculator Features:**
- Project type selection (Rooftop, Ground, Commercial, Utility-Scale)
- Location-based calculations
- System size configuration
- Mounting type options
- Budget analysis
- Payback period calculation
- CO2 offset estimates
- Energy production forecasts

**Test Parameters:**
```json
{
  "projectType": "ROOFTOP",
  "location": "Austin, TX",
  "systemSizeKw": 100,
  "panelWattage": 400,
  "mountingType": "FIXED",
  "targetBudget": 200000
}
```

---

## 📊 **SAMPLE DATA AVAILABLE**

### **Enterprise Listings (6 total)**
1. **Industrial Rooftop Solar Installation** - TerraMount (500kW+)
2. **Commercial Solar Panel Supply** - SunPower Industrial (Tier 1 modules)
3. **Solar Racking & Mounting Systems** - Green Energy Solutions
4. **TerraInvert Utility-Scale String Inverters** - Terra Smart
5. **SunPower Maxeon Commercial Panels** - SunPower
6. **TerraMount Commercial Racking System** - Terra Smart

### **Quote Requests (2 active)**
1. **ManufacturePlus Industries** → 1200kW rooftop installation
2. **TechCorp Enterprises** → 800kW carport installation

### **ROI Simulations (2 sample)**
1. **Detroit Manufacturing Facility** - 1200kW rooftop system
2. **San Jose Tech Campus** - 800kW carport system

---

## 🌐 **API ENDPOINTS FOR TESTING**

### **Enterprise Listings**
```bash
# Get all enterprise listings
curl -s 'http://localhost:5001/api/enterprise/listings'

# Get specific listing
curl -s 'http://localhost:5001/api/enterprise/listings/{id}'
```

### **ROI Calculator**
```bash
# Calculate ROI
curl -s 'http://localhost:5001/api/roi/calculate' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectType": "ROOFTOP",
    "location": "Austin, TX",
    "systemSizeKw": 100,
    "panelWattage": 400,
    "mountingType": "FIXED",
    "targetBudget": 200000
  }'
```

### **Quote Requests** (Requires Authentication)
```bash
# Get quote requests (for vendors)
curl -s 'http://localhost:5001/api/enterprise/quotes/requests' \
  -H 'Authorization: Bearer {jwt_token}'

# Create quote request (for customers)
curl -s 'http://localhost:5001/api/enterprise/quotes/request' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {jwt_token}' \
  -d '{...quote_request_data}'
```

---

## 🔍 **TESTING CHECKLIST**

### **✅ Core Functionality**
- [ ] Enterprise vendor registration and login
- [ ] Enterprise customer registration and login
- [ ] Browse enterprise listings
- [ ] Request quotes from vendors
- [ ] Vendor quote responses
- [ ] ROI calculator with various parameters
- [ ] Document upload/download
- [ ] Messaging between vendors and customers

### **✅ User Experience**
- [ ] Responsive design on mobile/tablet
- [ ] Search and filter enterprise listings
- [ ] Quote request form validation
- [ ] ROI calculator user interface
- [ ] File upload progress indicators
- [ ] Real-time messaging notifications

### **✅ Business Logic**
- [ ] Quote request workflow
- [ ] ROI calculation accuracy
- [ ] Vendor-customer matching
- [ ] Project specification handling
- [ ] Pricing and delivery terms
- [ ] Document management

### **✅ Security & Performance**
- [ ] Authentication and authorization
- [ ] File upload security
- [ ] API rate limiting
- [ ] Data validation
- [ ] Error handling
- [ ] Performance under load

---

## 🚀 **DEPLOYMENT URLS**

- **Frontend**: http://localhost:3000
- **API Service**: http://localhost:5001
- **Auth Service**: http://localhost:4000

---

## 📞 **TESTING SUPPORT**

### **Feature Status**
- ✅ **Enterprise Listings**: Fully operational
- ✅ **Quote System**: Fully operational
- ✅ **ROI Simulator**: Fully operational
- ✅ **Document Upload**: Ready for testing
- ✅ **Messaging System**: Integrated and working
- ✅ **Authentication**: Multi-role support active

### **Known Testing Areas**
1. **Quote Workflow**: End-to-end quote request and response
2. **ROI Calculations**: Verify accuracy with real-world data
3. **Document Handling**: Upload/download of technical documents
4. **Communication**: Vendor-customer messaging
5. **Mobile Experience**: Responsive design testing
6. **Performance**: Load testing with multiple users

---

## 🎯 **SUCCESS CRITERIA**

**The Enterprise Quote System and ROI Simulator are ready for production when:**

✅ **Vendors can successfully:**
- Create and manage enterprise listings
- Receive and respond to quote requests
- Upload technical documents and proposals
- Communicate with potential customers

✅ **Customers can successfully:**
- Browse and search enterprise listings
- Request detailed quotes for projects
- Use ROI simulator for investment analysis
- Compare vendor proposals and make decisions

✅ **System demonstrates:**
- Reliable quote request/response workflow
- Accurate ROI calculations
- Secure document handling
- Effective vendor-customer communication
- Scalable architecture for growth

**🎉 The enterprise features are now live and ready for industrial solar commerce!** 