(function () {
  const STORAGE_KEY = "smartsplit-state-v1";
  const rupee = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const budgetSplit = [
    { category: "Rent", percent: 30, color: "#183a6b" },
    { category: "Food", percent: 12, color: "#20b8a6" },
    { category: "Grocery", percent: 15, color: "#2d9cdb" },
    { category: "Electricity", percent: 8, color: "#f4a51c" },
    { category: "Entertainment", percent: 10, color: "#e85f5c" },
    { category: "Savings", percent: 25, color: "#2fb477" },
  ];

  const cityProfiles = {
    Mumbai: {
      costIndex: 1.22,
      rentGuardrail: 35,
      transport: "Local train and metro buffers help offset high rent pressure.",
      shifts: { Rent: 5, Food: 1, Grocery: 0, Electricity: 0, Entertainment: -1, Savings: -5 },
    },
    Bangalore: {
      costIndex: 1.14,
      rentGuardrail: 33,
      transport: "Traffic-heavy commutes make transport planning unusually important.",
      shifts: { Rent: 3, Food: 1, Grocery: 0, Electricity: 0, Entertainment: 0, Savings: -4 },
    },
    Delhi: {
      costIndex: 1.08,
      rentGuardrail: 31,
      transport: "Utilities and transport can swing sharply by season and commute.",
      shifts: { Rent: 1, Food: 0, Grocery: 0, Electricity: 2, Entertainment: 0, Savings: -3 },
    },
    Hyderabad: {
      costIndex: 0.96,
      rentGuardrail: 28,
      transport: "Lower rent pressure creates extra room for investments.",
      shifts: { Rent: -2, Food: 0, Grocery: 1, Electricity: 0, Entertainment: 0, Savings: 1 },
    },
    Pune: {
      costIndex: 0.98,
      rentGuardrail: 29,
      transport: "Balanced housing and commute costs support steadier savings.",
      shifts: { Rent: -1, Food: 0, Grocery: 0, Electricity: 0, Entertainment: 0, Savings: 1 },
    },
  };

  const defaultCityProfile = {
    costIndex: 1,
    rentGuardrail: 30,
    transport: "Use local rent, commute, and utility costs to fine-tune this city budget.",
    shifts: { Rent: 0, Food: 0, Grocery: 0, Electricity: 0, Entertainment: 0, Savings: 0 },
  };

  const location = (name, prefixes) => ({ name, prefixes });
  const stateCityDirectory = [
    {
      state: "Andhra Pradesh",
      cities: [
        location("Visakhapatnam", ["530"]), location("Vijayawada", ["520"]), location("Guntur", ["522"]),
        location("Nellore", ["524"]), location("Kurnool", ["518"]), location("Rajahmundry", ["533"]),
        location("Tirupati", ["517"]), location("Kakinada", ["533"]), location("Anantapur", ["515"]),
        location("Kadapa", ["516"]), location("Eluru", ["534"]), location("Ongole", ["523"]),
      ],
    },
    {
      state: "Arunachal Pradesh",
      cities: [
        location("Itanagar", ["791"]), location("Naharlagun", ["791"]), location("Pasighat", ["791"]),
        location("Tawang", ["790"]), location("Ziro", ["791"]), location("Bomdila", ["790"]),
      ],
    },
    {
      state: "Assam",
      cities: [
        location("Guwahati", ["781"]), location("Dibrugarh", ["786"]), location("Silchar", ["788"]),
        location("Jorhat", ["785"]), location("Tezpur", ["784"]), location("Nagaon", ["782"]),
        location("Tinsukia", ["786"]), location("Bongaigaon", ["783"]), location("Dhubri", ["783"]),
      ],
    },
    {
      state: "Bihar",
      cities: [
        location("Patna", ["800"]), location("Gaya", ["823"]), location("Bhagalpur", ["812"]),
        location("Muzaffarpur", ["842"]), location("Darbhanga", ["846"]), location("Purnia", ["854"]),
        location("Begusarai", ["851"]), location("Katihar", ["854"]), location("Arrah", ["802"]),
        location("Bihar Sharif", ["803"]),
      ],
    },
    {
      state: "Chhattisgarh",
      cities: [
        location("Raipur", ["492"]), location("Bhilai", ["490"]), location("Durg", ["491"]),
        location("Bilaspur", ["495"]), location("Korba", ["495"]), location("Raigarh", ["496"]),
        location("Jagdalpur", ["494"]), location("Ambikapur", ["497"]),
      ],
    },
    {
      state: "Goa",
      cities: [
        location("Panaji", ["403"]), location("Margao", ["403"]), location("Vasco da Gama", ["403"]),
        location("Mapusa", ["403"]), location("Ponda", ["403"]), location("Bicholim", ["403"]),
      ],
    },
    {
      state: "Gujarat",
      cities: [
        location("Ahmedabad", ["380"]), location("Surat", ["395"]), location("Vadodara", ["390"]),
        location("Rajkot", ["360"]), location("Gandhinagar", ["382"]), location("Bhavnagar", ["364"]),
        location("Jamnagar", ["361"]), location("Junagadh", ["362"]), location("Anand", ["388"]),
        location("Bharuch", ["392"]), location("Vapi", ["396"]), location("Gandhidham", ["370"]),
      ],
    },
    {
      state: "Haryana",
      cities: [
        location("Gurugram", ["122"]), location("Faridabad", ["121"]), location("Panipat", ["132"]),
        location("Ambala", ["133"]), location("Hisar", ["125"]), location("Karnal", ["132"]),
        location("Rohtak", ["124"]), location("Sonipat", ["131"]), location("Yamunanagar", ["135"]),
        location("Panchkula", ["134"]),
      ],
    },
    {
      state: "Himachal Pradesh",
      cities: [
        location("Shimla", ["171"]), location("Dharamshala", ["176"]), location("Mandi", ["175"]),
        location("Solan", ["173"]), location("Kullu", ["175"]), location("Una", ["174"]),
        location("Hamirpur", ["177"]), location("Bilaspur", ["174"]),
      ],
    },
    {
      state: "Jharkhand",
      cities: [
        location("Ranchi", ["834"]), location("Jamshedpur", ["831"]), location("Dhanbad", ["826"]),
        location("Bokaro", ["827"]), location("Deoghar", ["814"]), location("Hazaribagh", ["825"]),
        location("Giridih", ["815"]), location("Ramgarh", ["829"]),
      ],
    },
    {
      state: "Karnataka",
      cities: [
        location("Bangalore", ["560"]), location("Mysuru", ["570"]), location("Mangaluru", ["575"]),
        location("Hubballi", ["580"]), location("Dharwad", ["580"]), location("Belagavi", ["590"]),
        location("Kalaburagi", ["585"]), location("Davangere", ["577"]), location("Ballari", ["583"]),
        location("Shivamogga", ["577"]), location("Tumakuru", ["572"]), location("Udupi", ["576"]),
      ],
    },
    {
      state: "Kerala",
      cities: [
        location("Thiruvananthapuram", ["695"]), location("Kochi", ["682"]), location("Kozhikode", ["673"]),
        location("Thrissur", ["680"]), location("Kollam", ["691"]), location("Alappuzha", ["688"]),
        location("Palakkad", ["678"]), location("Kannur", ["670"]), location("Kottayam", ["686"]),
        location("Malappuram", ["676"]),
      ],
    },
    {
      state: "Madhya Pradesh",
      cities: [
        location("Indore", ["452"]), location("Bhopal", ["462"]), location("Jabalpur", ["482"]),
        location("Gwalior", ["474"]), location("Ujjain", ["456"]), location("Sagar", ["470"]),
        location("Dewas", ["455"]), location("Satna", ["485"]), location("Ratlam", ["457"]),
        location("Rewa", ["486"]),
      ],
    },
    {
      state: "Maharashtra",
      cities: [
        location("Mumbai", ["400"]), location("Pune", ["411"]), location("Nagpur", ["440"]),
        location("Nashik", ["422"]), location("Thane", ["400"]), location("Navi Mumbai", ["400", "410"]),
        location("Aurangabad", ["431"]), location("Solapur", ["413"]), location("Kolhapur", ["416"]),
        location("Amravati", ["444"]), location("Nanded", ["431"]), location("Sangli", ["416"]),
      ],
    },
    {
      state: "Manipur",
      cities: [
        location("Imphal", ["795"]), location("Thoubal", ["795"]), location("Bishnupur", ["795"]),
        location("Churachandpur", ["795"]), location("Kakching", ["795"]),
      ],
    },
    {
      state: "Meghalaya",
      cities: [
        location("Shillong", ["793"]), location("Tura", ["794"]), location("Jowai", ["793"]),
        location("Nongpoh", ["793"]), location("Williamnagar", ["794"]),
      ],
    },
    {
      state: "Mizoram",
      cities: [
        location("Aizawl", ["796"]), location("Lunglei", ["796"]), location("Champhai", ["796"]),
        location("Serchhip", ["796"]), location("Kolasib", ["796"]),
      ],
    },
    {
      state: "Nagaland",
      cities: [
        location("Kohima", ["797"]), location("Dimapur", ["797"]), location("Mokokchung", ["798"]),
        location("Tuensang", ["798"]), location("Wokha", ["797"]),
      ],
    },
    {
      state: "Odisha",
      cities: [
        location("Bhubaneswar", ["751"]), location("Cuttack", ["753"]), location("Rourkela", ["769"]),
        location("Berhampur", ["760"]), location("Sambalpur", ["768"]), location("Puri", ["752"]),
        location("Balasore", ["756"]), location("Baripada", ["757"]), location("Jharsuguda", ["768"]),
      ],
    },
    {
      state: "Punjab",
      cities: [
        location("Ludhiana", ["141"]), location("Amritsar", ["143"]), location("Jalandhar", ["144"]),
        location("Patiala", ["147"]), location("Bathinda", ["151"]), location("Mohali", ["160"]),
        location("Pathankot", ["145"]), location("Hoshiarpur", ["146"]), location("Moga", ["142"]),
      ],
    },
    {
      state: "Rajasthan",
      cities: [
        location("Jaipur", ["302"]), location("Jodhpur", ["342"]), location("Udaipur", ["313"]),
        location("Kota", ["324"]), location("Ajmer", ["305"]), location("Bikaner", ["334"]),
        location("Alwar", ["301"]), location("Bharatpur", ["321"]), location("Sikar", ["332"]),
        location("Pali", ["306"]),
      ],
    },
    {
      state: "Sikkim",
      cities: [
        location("Gangtok", ["737"]), location("Namchi", ["737"]), location("Gyalshing", ["737"]),
        location("Mangan", ["737"]), location("Rangpo", ["737"]),
      ],
    },
    {
      state: "Tamil Nadu",
      cities: [
        location("Chennai", ["600"]), location("Coimbatore", ["641"]), location("Madurai", ["625"]),
        location("Tiruchirappalli", ["620"]), location("Salem", ["636"]), location("Tiruppur", ["641"]),
        location("Erode", ["638"]), location("Vellore", ["632"]), location("Thoothukudi", ["628"]),
        location("Tirunelveli", ["627"]), location("Thanjavur", ["613"]),
      ],
    },
    {
      state: "Telangana",
      cities: [
        location("Hyderabad", ["500"]), location("Secunderabad", ["500"]), location("Manikonda", ["500"]),
        location("Warangal", ["506"]), location("Karimnagar", ["505"]), location("Nizamabad", ["503"]),
        location("Khammam", ["507"]), location("Nalgonda", ["508"]), location("Mahbubnagar", ["509"]),
        location("Adilabad", ["504"]), location("Siddipet", ["502"]), location("Suryapet", ["508"]),
      ],
    },
    {
      state: "Tripura",
      cities: [
        location("Agartala", ["799"]), location("Udaipur", ["799"]), location("Dharmanagar", ["799"]),
        location("Kailashahar", ["799"]), location("Belonia", ["799"]),
      ],
    },
    {
      state: "Uttar Pradesh",
      cities: [
        location("Lucknow", ["226"]), location("Kanpur", ["208"]), location("Varanasi", ["221"]),
        location("Agra", ["282"]), location("Prayagraj", ["211"]), location("Ghaziabad", ["201"]),
        location("Noida", ["201"]), location("Meerut", ["250"]), location("Bareilly", ["243"]),
        location("Aligarh", ["202"]), location("Gorakhpur", ["273"]), location("Moradabad", ["244"]),
      ],
    },
    {
      state: "Uttarakhand",
      cities: [
        location("Dehradun", ["248"]), location("Haridwar", ["249"]), location("Roorkee", ["247"]),
        location("Haldwani", ["263"]), location("Rudrapur", ["263"]), location("Nainital", ["263"]),
        location("Rishikesh", ["249"]),
      ],
    },
    {
      state: "West Bengal",
      cities: [
        location("Kolkata", ["700"]), location("Howrah", ["711"]), location("Durgapur", ["713"]),
        location("Asansol", ["713"]), location("Siliguri", ["734"]), location("Darjeeling", ["734"]),
        location("Kharagpur", ["721"]), location("Haldia", ["721"]), location("Bardhaman", ["713"]),
        location("Malda", ["732"]),
      ],
    },
    {
      state: "Andaman and Nicobar Islands",
      cities: [location("Port Blair", ["744"]), location("Mayabunder", ["744"]), location("Car Nicobar", ["744"])],
    },
    {
      state: "Chandigarh",
      cities: [location("Chandigarh", ["160"])],
    },
    {
      state: "Dadra and Nagar Haveli and Daman and Diu",
      cities: [location("Silvassa", ["396"]), location("Daman", ["396"]), location("Diu", ["362"])],
    },
    {
      state: "Delhi",
      cities: [location("Delhi", ["110"]), location("New Delhi", ["110"]), location("Dwarka", ["110"]), location("Rohini", ["110"]), location("Saket", ["110"])],
    },
    {
      state: "Jammu and Kashmir",
      cities: [
        location("Srinagar", ["190"]), location("Jammu", ["180"]), location("Anantnag", ["192"]),
        location("Baramulla", ["193"]), location("Udhampur", ["182"]), location("Kathua", ["184"]),
      ],
    },
    {
      state: "Ladakh",
      cities: [location("Leh", ["194"]), location("Kargil", ["194"])],
    },
    {
      state: "Lakshadweep",
      cities: [location("Kavaratti", ["682"]), location("Agatti", ["682"]), location("Minicoy", ["682"])],
    },
    {
      state: "Puducherry",
      cities: [location("Puducherry", ["605"]), location("Karaikal", ["609"]), location("Mahe", ["673"]), location("Yanam", ["533"])],
    },
  ];

  const state = {
    profile: null,
    expenses: [],
    userDetails: {},
    users: [],
    currentUser: null,
    trackingFiles: [],
    ...(loadState() || {}),
  };
  let trackingSwipeStart = null;

  const els = {
    authPage: document.querySelector("#authPage"),
    loginForm: document.querySelector("#loginForm"),
    registerForm: document.querySelector("#registerForm"),
    authStatus: document.querySelector("#authStatus"),
    registerStatus: document.querySelector("#registerStatus"),
    showRegister: document.querySelector("#showRegister"),
    showLogin: document.querySelector("#showLogin"),
    setupPanel: document.querySelector("#setupPanel"),
    dashboard: document.querySelector("#dashboard"),
    trackingPage: document.querySelector("#trackingPage"),
    profilePage: document.querySelector("#profilePage"),
    userDetailsPage: document.querySelector("#userDetailsPage"),
    newTrackingFile: document.querySelector("#newTrackingFile"),
    cancelTrackingFile: document.querySelector("#cancelTrackingFile"),
    trackingCreatePanel: document.querySelector("#trackingCreatePanel"),
    trackingFileForm: document.querySelector("#trackingFileForm"),
    trackingFilesContainer: document.querySelector("#trackingFilesContainer"),
    bottomTabbar: document.querySelector("#bottomTabbar"),
    setupForm: document.querySelector("#setupForm"),
    userDetailsForm: document.querySelector("#userDetailsForm"),
    userDetailsStatus: document.querySelector("#userDetailsStatus"),
    backToProfile: document.querySelector("#backToProfile"),
    logoutButton: document.querySelector("#logoutButton"),
    goStepTwo: document.querySelector("#goStepTwo"),
    backStepOne: document.querySelector("#backStepOne"),
    resetApp: document.querySelector("#resetApp"),
    editProfile: document.querySelector("#editProfile"),
    stateSelect: document.querySelector("#stateSelect"),
    citySelect: document.querySelector("#citySelect"),
    pinCode: document.querySelector("#pinCode"),
    expenseForm: document.querySelector("#expenseForm"),
    expenseSubmit: document.querySelector("#expenseSubmit"),
    budgetDoughnut: document.querySelector("#budgetDoughnut"),
    trendChart: document.querySelector("#trendChart"),
  };

  init();

  function init() {
    wireAuth();
    populateStateDropdown();
    populateCityDropdown("");
    wireLocationFields();
    wireSetupFlow();
    wireExpenseForm();
    wireTaskbar();
    wireProfilePages();
    wireTrackingPage();
    els.resetApp.addEventListener("click", resetApp);
    els.editProfile.addEventListener("click", () => showSetup(1, { activeTab: "home" }));
    window.addEventListener("resize", debounce(renderDashboard, 120));

    const today = new Date().toISOString().slice(0, 10);
    els.expenseForm.date.value = today;

    if (state.currentUser) enterHome();
    else showAuth("login");
  }

  function wireAuth() {
    els.showRegister.addEventListener("click", () => showAuth("register"));
    els.showLogin.addEventListener("click", () => showAuth("login"));
    els.authPage.addEventListener("click", (event) => {
      const button = event.target.closest("[data-social-provider]");
      if (!button) return;
      handleSocialAuth(button.dataset.socialProvider);
    });
    els.registerForm.elements.newPassword.addEventListener("input", () => {
      renderPasswordCriteria(els.registerForm.elements.newPassword.value);
      els.registerStatus.textContent = "";
    });
    els.registerForm.elements.confirmPassword.addEventListener("input", () => {
      els.registerStatus.textContent = "";
    });

    els.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(els.loginForm);
      const username = String(data.get("username") || "").trim();
      const password = String(data.get("password") || "");
      const user = state.users.find((item) => item.username === username && item.password === password);

      if (!user) {
        els.authStatus.textContent = "Invalid username or password";
        return;
      }

      state.currentUser = username;
      state.userDetails = {
        loginId: username,
        ...(user.details || {}),
      };
      saveState();
      enterHome();
    });

    els.registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(els.registerForm);
      const username = String(data.get("registerUsername") || "").trim();
      const email = String(data.get("registerEmail") || "").trim();
      const mobile = String(data.get("registerPhone") || "").trim();
      const password = String(data.get("newPassword") || "");
      const confirmPassword = String(data.get("confirmPassword") || "");
      const passwordStatus = getPasswordCriteria(password);

      renderPasswordCriteria(password);
      if (!Object.values(passwordStatus).every(Boolean)) {
        els.registerStatus.textContent = "Password does not meet all criteria";
        return;
      }

      if (password !== confirmPassword) {
        els.registerStatus.textContent = "Passwords do not match";
        return;
      }

      if (state.users.some((user) => user.username === username)) {
        els.registerStatus.textContent = "Username already exists";
        return;
      }

      const initialDetails = {
        loginId: username,
        email,
        mobile,
      };
      state.users.push({ username, password, details: initialDetails });
      state.currentUser = username;
      state.userDetails = initialDetails;
      saveState();
      enterHome();
    });

    els.logoutButton.addEventListener("click", logoutUser);
  }

  function handleSocialAuth(provider) {
    const normalizedProvider = String(provider || "").trim();
    if (!normalizedProvider) return;

    const username = `${normalizedProvider.toLowerCase()}_user`;
    const email = `${normalizedProvider.toLowerCase()}.user@smartsplit.local`;
    let user = state.users.find((item) => item.username === username && item.authProvider === normalizedProvider);

    if (!user) {
      const details = {
        fullName: `${normalizedProvider} User`,
        loginId: username,
        email,
        mobile: "",
        authProvider: normalizedProvider,
      };
      user = {
        username,
        password: "",
        authProvider: normalizedProvider,
        details,
      };
      state.users.push(user);
    }

    state.currentUser = user.username;
    state.userDetails = {
      loginId: user.username,
      ...(user.details || {}),
    };
    els.authStatus.textContent = "";
    els.registerStatus.textContent = "";
    saveState();
    enterHome();
  }

  function wireLocationFields() {
    els.stateSelect.addEventListener("change", () => {
      populateCityDropdown(els.stateSelect.value);
      validatePinCode();
    });

    els.citySelect.addEventListener("change", validatePinCode);
    els.pinCode.addEventListener("input", () => {
      els.pinCode.value = els.pinCode.value.replace(/\D/g, "").slice(0, 6);
      validatePinCode();
    });
  }

  function wireSetupFlow() {
    document.querySelectorAll(".choice-group").forEach((group) => {
      syncChoiceGroup(group);
      group.addEventListener("click", (event) => {
        const button = event.target.closest(".choice-card");
        if (!button) return;
        group.querySelectorAll(".choice-card").forEach((card) => card.classList.remove("active"));
        button.classList.add("active");
        syncChoiceGroup(group);
      });
    });

    document.querySelectorAll(".amount-range").forEach((input) => {
      updateAmountOutput(input);
      input.addEventListener("input", () => updateAmountOutput(input));
    });

    els.goStepTwo.addEventListener("click", () => {
      if (validateStepOne()) showSetupStep(2);
    });

    els.backStepOne.addEventListener("click", () => showSetupStep(1));

    els.setupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateStepOne()) return;
      state.profile = collectProfile();
      saveState();
      showDashboard();
    });
  }

  function wireExpenseForm() {
    els.expenseForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(els.expenseForm);
      const editingId = data.get("editingId");
      const entry = {
        id: editingId || crypto.randomUUID(),
        amount: toNumber(data.get("amount")),
        category: String(data.get("category")),
        date: String(data.get("date")),
        note: String(data.get("note") || "").trim(),
        source: "manual",
      };

      if (editingId) {
        state.expenses = state.expenses.map((item) => (item.id === editingId ? entry : item));
      } else {
        state.expenses.push(entry);
      }

      els.expenseForm.reset();
      els.expenseForm.date.value = new Date().toISOString().slice(0, 10);
      els.expenseSubmit.textContent = "Add expense";
      saveState();
      renderDashboard();
    });
  }

  function wireTaskbar() {
    els.bottomTabbar.addEventListener("click", (event) => {
      const button = event.target.closest(".tabbar-button");
      if (!button) return;
      goToTab(button.dataset.tab);
    });
  }

  function wireProfilePages() {
    els.profilePage.addEventListener("click", (event) => {
      const action = event.target.closest("[data-profile-action]");
      if (!action) return;

      if (action.dataset.profileAction === "login") showUserDetailsPage();
      if (action.dataset.profileAction === "tracking") goToTab("tracking");
      if (action.dataset.profileAction === "financial-basics") startNewFinancialBasics();
    });

    els.backToProfile.addEventListener("click", showProfilePage);

    els.userDetailsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(els.userDetailsForm);
      state.userDetails = {
        fullName: String(data.get("fullName") || "").trim(),
        mobile: String(data.get("mobile") || "").trim(),
        email: String(data.get("email") || "").trim(),
        loginId: String(data.get("loginId") || "").trim() || state.currentUser || "",
      };
      const user = state.users.find((item) => item.username === state.currentUser);
      if (user) user.details = state.userDetails;
      saveState();
      els.userDetailsStatus.textContent = "Details saved";
      renderProfileSummary();
    });
  }

  function wireTrackingPage() {
    els.newTrackingFile.addEventListener("click", () => {
      els.trackingCreatePanel.classList.remove("hidden");
      els.trackingFileForm.elements.fileName.value = "";
    });

    els.cancelTrackingFile.addEventListener("click", () => {
      els.trackingCreatePanel.classList.add("hidden");
      els.trackingFileForm.reset();
    });

    els.trackingFileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(els.trackingFileForm);
      const name = String(data.get("fileName") || "").trim();
      if (!name) return;

      state.trackingFiles.unshift({
        id: crypto.randomUUID(),
        name,
        entries: [],
        isSaved: false,
        isExpanded: true,
        isEditing: true,
        createdAt: new Date().toISOString(),
      });
      els.trackingFileForm.reset();
      els.trackingCreatePanel.classList.add("hidden");
      saveState();
      renderTrackingPage();
    });

    els.trackingFilesContainer.addEventListener("submit", (event) => {
      const form = event.target.closest(".tracking-field-form");
      if (!form) return;
      event.preventDefault();

      const file = state.trackingFiles.find((item) => item.id === form.dataset.fileId);
      if (!file) return;

      const data = new FormData(form);
      const fieldName = String(data.get("fieldName") || "").trim();
      const amount = toNumber(data.get("amount"));
      const type = String(data.get("type") || "spending");
      if (!fieldName || !amount) return;

      file.entries.unshift({
        id: crypto.randomUUID(),
        fieldName,
        amount,
        type,
        createdAt: new Date().toISOString(),
      });
      form.reset();
      saveState();
      renderTrackingPage();
    });

    els.trackingFilesContainer.addEventListener("click", (event) => {
      const action = event.target.closest("[data-tracking-action]");
      if (action) {
        const file = state.trackingFiles.find((item) => item.id === action.dataset.fileId);
        if (!file && action.dataset.trackingAction !== "delete") return;

        if (action.dataset.trackingAction === "save") {
          file.isSaved = true;
          file.isExpanded = false;
          file.isEditing = false;
        }

        if (action.dataset.trackingAction === "edit") {
          file.isSaved = false;
          file.isExpanded = true;
          file.isEditing = true;
        }

        if (action.dataset.trackingAction === "delete") {
          state.trackingFiles = state.trackingFiles.filter((item) => item.id !== action.dataset.fileId);
        }

        saveState();
        renderTrackingPage();
        return;
      }

      const header = event.target.closest(".tracking-file-header");
      if (!header) return;
      const file = state.trackingFiles.find((item) => item.id === header.dataset.fileId);
      if (!file || file.isEditing) return;
      file.isExpanded = !file.isExpanded;
      saveState();
      renderTrackingPage();
    });

    els.trackingFilesContainer.addEventListener("pointerdown", (event) => {
      const entryRow = event.target.closest(".tracking-entry");
      if (!entryRow) return;
      trackingSwipeStart = {
        entryId: entryRow.dataset.entryId,
        fileId: entryRow.dataset.fileId,
        x: event.clientX,
      };
    });

    els.trackingFilesContainer.addEventListener("pointerup", (event) => {
      const entryRow = event.target.closest(".tracking-entry");
      if (!entryRow || !trackingSwipeStart) return;
      if (entryRow.dataset.entryId !== trackingSwipeStart.entryId || entryRow.dataset.fileId !== trackingSwipeStart.fileId) {
        trackingSwipeStart = null;
        return;
      }

      const deltaX = event.clientX - trackingSwipeStart.x;
      trackingSwipeStart = null;
      if (Math.abs(deltaX) < 45) return;
      setTrackingEntryDone(entryRow.dataset.fileId, entryRow.dataset.entryId, deltaX > 0);
    });

    els.trackingFilesContainer.addEventListener("pointercancel", () => {
      trackingSwipeStart = null;
    });

    els.trackingPage.addEventListener("click", (event) => {
      if (event.target.closest(".tracking-file-card")) return;
      if (event.target.closest("#newTrackingFile, #trackingCreatePanel")) return;
      if (collapseTrackingFiles()) renderTrackingPage();
    });
  }

  function setTrackingEntryDone(fileId, entryId, done) {
    const file = state.trackingFiles.find((item) => item.id === fileId);
    const entry = file?.entries?.find((item) => item.id === entryId);
    if (!entry) return;
    entry.done = done;
    saveState();
    renderTrackingPage();
  }

  function collapseTrackingFiles() {
    let changed = false;
    (state.trackingFiles || []).forEach((file) => {
      if (!file.isSaved || file.isExpanded || file.isEditing) {
        file.isSaved = true;
        file.isExpanded = false;
        file.isEditing = false;
        changed = true;
      }
    });

    if (!els.trackingCreatePanel.classList.contains("hidden")) {
      els.trackingCreatePanel.classList.add("hidden");
      els.trackingFileForm.reset();
      changed = true;
    }

    if (changed) saveState();
    return changed;
  }

  function showAuth(mode) {
    hidePages();
    els.authPage.classList.remove("hidden");
    els.bottomTabbar.classList.add("hidden");
    els.resetApp.classList.add("hidden");
    els.authStatus.textContent = "";
    els.registerStatus.textContent = "";
    els.loginForm.classList.toggle("hidden", mode !== "login");
    els.registerForm.classList.toggle("hidden", mode !== "register");
    renderPasswordCriteria("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enterHome() {
    els.resetApp.classList.remove("hidden");
    els.loginForm.reset();
    els.registerForm.reset();
    if (state.profile) showDashboard("home");
    else showSetup(1, { activeTab: "home" });
  }

  function logoutUser() {
    state.currentUser = null;
    saveState();
    showAuth("login");
  }

  function getPasswordCriteria(password) {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }

  function renderPasswordCriteria(password) {
    const status = getPasswordCriteria(password);
    document.querySelectorAll("#passwordCriteria li").forEach((item) => {
      item.classList.toggle("valid", Boolean(status[item.dataset.rule]));
    });
  }

  function validateStepOne() {
    validatePinCode();
    const stepOneInputs = [...document.querySelector('[data-step="1"]').querySelectorAll("input, select")];
    return stepOneInputs.every((input) => input.reportValidity());
  }

  function collectProfile() {
    const data = new FormData(els.setupForm);
    const lifestyle = {};
    const lifestyleAmounts = {};
    document.querySelectorAll(".choice-group").forEach((group) => {
      const name = group.dataset.name;
      const active = group.querySelector(".choice-card.active");
      const range = group.querySelector(".amount-range");
      lifestyle[name] = active ? active.dataset.value : "";
      lifestyleAmounts[name] = range ? toNumber(range.value) : 0;
    });

    return {
      monthlyIncome: toNumber(data.get("monthlyIncome")),
      state: String(data.get("state")),
      city: String(data.get("city")),
      pincode: String(data.get("pincode") || "").trim(),
      emi: toNumber(data.get("emi")),
      additionalIncome: toNumber(data.get("additionalIncome")),
      bonusExpected: toNumber(data.get("bonusExpected")),
      rent: toNumber(data.get("rent")),
      schoolFees: toNumber(data.get("schoolFees")),
      insurance: toNumber(data.get("insurance")),
      sip: toNumber(data.get("sip")),
      loanPayments: toNumber(data.get("loanPayments")),
      lifestyle,
      lifestyleAmounts,
      createdAt: new Date().toISOString(),
    };
  }

  function populateStateDropdown(selectedState = "") {
    els.stateSelect.innerHTML = `<option value="" disabled>Select state</option>`;
    stateCityDirectory.forEach(({ state: stateName }) => {
      const option = document.createElement("option");
      option.value = stateName;
      option.textContent = stateName;
      els.stateSelect.append(option);
    });
    els.stateSelect.value = selectedState || "";
  }

  function populateCityDropdown(stateName, selectedCity = "") {
    const stateRecord = getStateRecord(stateName);
    els.citySelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.textContent = stateRecord ? "Select city" : "Select state first";
    els.citySelect.append(placeholder);

    if (!stateRecord) {
      els.citySelect.disabled = true;
      els.citySelect.value = "";
      return;
    }

    stateRecord.cities.forEach((cityRecord) => {
      const option = document.createElement("option");
      option.value = cityRecord.name;
      option.textContent = cityRecord.name;
      els.citySelect.append(option);
    });

    els.citySelect.disabled = false;
    els.citySelect.value = getMatchingCityName(stateName, selectedCity) || "";
  }

  function validatePinCode() {
    const pincode = els.pinCode.value.trim();
    const cityRecord = getCityRecord(els.stateSelect.value, els.citySelect.value);
    let message = "";

    if (pincode && !/^\d{6}$/.test(pincode)) {
      message = "Enter a valid 6-digit PIN code.";
    } else if (pincode && cityRecord && !cityRecord.prefixes.some((prefix) => pincode.startsWith(prefix))) {
      message = `${els.citySelect.value} PIN code should start with ${cityRecord.prefixes.join(" or ")}.`;
    }

    els.pinCode.setCustomValidity(message);
    return !message;
  }

  function getStateRecord(stateName) {
    return stateCityDirectory.find((entry) => entry.state === stateName);
  }

  function getCityRecord(stateName, cityName) {
    const stateRecord = getStateRecord(stateName);
    if (!stateRecord) return null;
    const normalizedCity = normalizeLocation(cityName);
    return stateRecord.cities.find((cityRecord) => normalizeLocation(cityRecord.name) === normalizedCity) || null;
  }

  function inferStateFromCity(cityName) {
    const normalizedCity = normalizeLocation(cityName);
    if (!normalizedCity) return "";
    const stateRecord = stateCityDirectory.find((entry) => (
      entry.cities.some((cityRecord) => normalizeLocation(cityRecord.name) === normalizedCity)
    ));
    return stateRecord ? stateRecord.state : "";
  }

  function getMatchingCityName(stateName, cityName) {
    const cityRecord = getCityRecord(stateName, cityName);
    return cityRecord ? cityRecord.name : "";
  }

  function normalizeLocation(value) {
    return String(value || "").trim().toLowerCase();
  }

  function hidePages() {
    if (!els.trackingPage.classList.contains("hidden")) collapseTrackingFiles();
    els.authPage.classList.add("hidden");
    els.setupPanel.classList.add("hidden");
    els.dashboard.classList.add("hidden");
    els.trackingPage.classList.add("hidden");
    els.profilePage.classList.add("hidden");
    els.userDetailsPage.classList.add("hidden");
  }

  function showSetup(step, options = {}) {
    hidePages();
    els.setupPanel.classList.remove("hidden");
    els.bottomTabbar.classList.remove("hidden");
    els.resetApp.classList.remove("hidden");
    activateTab(options.activeTab || "profile");
    if (options.blank) clearSetupForm();
    else hydrateForm();
    showSetupStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showSetupStep(step) {
    document.querySelectorAll(".form-step").forEach((formStep) => {
      formStep.classList.toggle("active", Number(formStep.dataset.step) === step);
    });
    document.querySelectorAll("[data-step-indicator]").forEach((indicator) => {
      indicator.classList.toggle("active", Number(indicator.dataset.stepIndicator) === step);
    });
  }

  function showDashboard(activeTab = "home") {
    hidePages();
    els.dashboard.classList.remove("hidden");
    els.bottomTabbar.classList.remove("hidden");
    els.resetApp.classList.remove("hidden");
    activateTab(activeTab);
    renderDashboard();
  }

  function showTrackingPage() {
    hidePages();
    els.trackingPage.classList.remove("hidden");
    els.bottomTabbar.classList.remove("hidden");
    els.resetApp.classList.remove("hidden");
    activateTab("tracking");
    renderTrackingPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showProfilePage() {
    hidePages();
    els.profilePage.classList.remove("hidden");
    els.bottomTabbar.classList.remove("hidden");
    els.resetApp.classList.remove("hidden");
    activateTab("profile");
    renderProfileSummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showUserDetailsPage() {
    hidePages();
    els.userDetailsPage.classList.remove("hidden");
    els.bottomTabbar.classList.remove("hidden");
    els.resetApp.classList.remove("hidden");
    activateTab("profile");
    hydrateUserDetailsForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToTab(tabName) {
    if (tabName === "profile") {
      showProfilePage();
      return;
    }

    if (tabName === "tracking") {
      showTrackingPage();
      return;
    }

    if (!state.profile) {
      showSetup(1, { activeTab: "home" });
      return;
    }

    showDashboard(tabName);
    const target = document.querySelector("#homeSection");
    requestAnimationFrame(() => {
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function startNewFinancialBasics() {
    showSetup(1, { blank: true, activeTab: "home" });
  }

  function activateTab(tabName) {
    els.bottomTabbar.querySelectorAll(".tabbar-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tabName);
    });
  }

  function hydrateForm() {
    if (!state.profile) return;
    const selectedState = state.profile.state || inferStateFromCity(state.profile.city);
    populateStateDropdown(selectedState);
    populateCityDropdown(selectedState, state.profile.city);
    els.pinCode.value = state.profile.pincode || "";

    Object.entries(state.profile).forEach(([key, value]) => {
      if (["state", "city", "pincode", "neighborhood", "lifestyle", "lifestyleAmounts", "createdAt"].includes(key)) return;
      const field = els.setupForm.elements[key];
      if (field) field.value = value;
    });

    Object.entries(state.profile.lifestyle || {}).forEach(([name, value]) => {
      const group = document.querySelector(`.choice-group[data-name="${name}"]`);
      if (!group) return;
      group.querySelectorAll(".choice-card").forEach((card) => {
        card.classList.toggle("active", card.dataset.value === value);
      });
      syncChoiceGroup(group);
    });

    Object.entries(state.profile.lifestyleAmounts || {}).forEach(([name, value]) => {
      const field = els.setupForm.elements[`${name}Amount`];
      if (field) field.value = value;
    });

    document.querySelectorAll(".amount-range").forEach((input) => updateAmountOutput(input));
    validatePinCode();
  }

  function hydrateUserDetailsForm() {
    const details = state.userDetails || {};
    els.userDetailsForm.elements.fullName.value = details.fullName || "";
    els.userDetailsForm.elements.mobile.value = details.mobile || "";
    els.userDetailsForm.elements.email.value = details.email || "";
    els.userDetailsForm.elements.loginId.value = details.loginId || state.currentUser || "";
    els.userDetailsForm.elements.loginPin.value = "";
    els.userDetailsStatus.textContent = "";
  }

  function renderProfileSummary() {
    const details = state.userDetails || {};
    const name = details.fullName || state.currentUser || "Guest user";
    const plan = state.profile ? `${state.profile.city || "City not set"}, ${state.profile.state || "State not set"} plan ready` : "No active financial plan";
    setText("#profileSummary", `${name} | ${plan}`);
    renderProfileDetails();
  }

  function renderProfileDetails() {
    const details = state.userDetails || {};
    const displayName = details.fullName || state.currentUser || "Guest user";
    setText("#profileAccountName", displayName);
    setText("#profileUsername", state.currentUser || "-");
    setText("#profileLoginId", details.loginId || state.currentUser || "-");
    setText("#profileEmail", details.email || "-");
    setText("#profileMobile", details.mobile || "-");
  }

  function renderTrackingPage() {
    const files = state.trackingFiles || [];
    if (!files.length) {
      els.trackingFilesContainer.innerHTML = `
        <article class="tracking-empty">
          <div>
            <h2>No tracking files yet</h2>
            <p>Use the + Create file button to make your first tracker. Add spending amounts and gaining amounts.</p>
          </div>
        </article>
      `;
      return;
    }

    els.trackingFilesContainer.innerHTML = files.map((file) => {
      const entries = file.entries || [];
      const spendingTotal = entries.filter((entry) => entry.type === "spending").reduce((total, entry) => total + entry.amount, 0);
      const gainingTotal = entries.filter((entry) => entry.type === "gaining").reduce((total, entry) => total + entry.amount, 0);
      const balance = gainingTotal - spendingTotal;
      const isEditing = file.isEditing === true || file.isSaved !== true;
      const isExpanded = isEditing || file.isExpanded === true || file.isSaved !== true;
      const summary = `${entries.length} field${entries.length === 1 ? "" : "s"} | Balance ${balance >= 0 ? "+" : "-"}${formatMoney(Math.abs(balance))}`;
      const headerActions = isEditing
        ? `<button class="primary-button tracking-header-button" type="button" data-tracking-action="save" data-file-id="${file.id}">Save</button>`
        : isExpanded
          ? `<div class="tracking-file-actions">
              <button class="ghost-button tracking-header-button" type="button" data-tracking-action="edit" data-file-id="${file.id}">Edit</button>
              <button class="ghost-button tracking-header-button danger" type="button" data-tracking-action="delete" data-file-id="${file.id}">Del</button>
            </div>`
          : "";
      const entryHtml = entries.length
        ? entries.map((entry) => `
            <article class="tracking-entry ${entry.type} ${entry.done ? "done" : ""}" data-file-id="${file.id}" data-entry-id="${entry.id}" title="Click to mark done">
              <strong>${escapeHtml(entry.fieldName)}</strong>
              <span>${entry.type === "gaining" ? "+" : "-"}${formatMoney(entry.amount)}</span>
            </article>
          `).join("")
        : `<p class="tracking-entry-empty">No fields added yet.</p>`;

      return `
        <article class="tracking-file-card ${isExpanded ? "open" : "collapsed"}">
          <div class="tracking-file-header" data-file-id="${file.id}">
            <div>
              <h2>${escapeHtml(file.name)}</h2>
              <span>${summary}</span>
            </div>
            ${headerActions}
          </div>
          ${isExpanded ? `
            ${isEditing ? `
              <form class="tracking-field-form" data-file-id="${file.id}">
                <label>
                  Field Name
                  <input name="fieldName" type="text" maxlength="50" placeholder="Salary, food, rent..." required />
                </label>
                <label>
                  Value
                  <input name="amount" type="number" min="1" step="1" placeholder="Amount" required />
                </label>
                <label>
                  Type
                  <select name="type" required>
                    <option value="spending">Spending</option>
                    <option value="gaining">Gaining</option>
                  </select>
                </label>
                <button class="primary-button" type="submit">Add field</button>
              </form>
            ` : ""}
            <div class="tracking-entry-list">
              ${entryHtml}
              <div class="tracking-balance-box ${balance >= 0 ? "gaining" : "spending"}">
                <strong>Total Balance</strong>
                <span>${balance >= 0 ? "+" : "-"}${formatMoney(Math.abs(balance))}</span>
              </div>
            </div>
          ` : ""}
        </article>
      `;
    }).join("");
  }

  function renderDashboard() {
    if (!state.profile || els.dashboard.classList.contains("hidden")) return;

    const model = buildModel();
    renderIncomeSummary(model);
    renderAlerts(model);
    renderBudget(model);
    renderHealth(model);
    renderTransactions(model);
    renderInsights(model);
    renderTrend(model);
    renderPlanner(model);
    saveState();
  }

  function buildModel() {
    const profile = state.profile;
    const profileCity = getCityProfile(profile.city);
    const monthlySalary = profile.monthlyIncome;
    const extraIncome = profile.additionalIncome + profile.bonusExpected;
    const totalExpected = monthlySalary + extraIncome;
    const totalEmi = profile.emi + profile.loanPayments;
    const fixedObligations = profile.rent + profile.schoolFees + profile.insurance + profile.sip + totalEmi;
    const manualExpenseTotal = sum(state.expenses, "amount");
    const trackedExpenseTotal = sum(state.expenses, "amount") + totalEmi;
    const spendingTotal = Math.max(0, trackedExpenseTotal - profile.sip);
    const disposableIncome = Math.max(0, totalExpected - fixedObligations);
    const savingsProjection = totalExpected - spendingTotal;
    const categoryTotals = getCategoryTotals(state.expenses);
    const adjustedBudget = getAdjustedBudget(profile.city);
    const targetSavings = totalExpected * 0.25;
    const expenseDiscipline = getExpenseDiscipline(totalExpected, categoryTotals, adjustedBudget);
    const health = getHealthScore({
      totalExpected,
      savingsProjection,
      totalEmi,
      categoryTotals,
      adjustedBudget,
      expenseDiscipline,
    });

    return {
      profile,
      city: profileCity,
      totalExpected,
      monthlySalary,
      extraIncome,
      totalEmi,
      fixedObligations,
      manualExpenseTotal,
      trackedExpenseTotal,
      spendingTotal,
      disposableIncome,
      savingsProjection,
      categoryTotals,
      adjustedBudget,
      targetSavings,
      expenseDiscipline,
      health,
    };
  }

  function renderIncomeSummary(model) {
    setText("#dashboardContext", `${model.profile.city}, ${model.profile.state} ${model.profile.pincode ? `| PIN ${model.profile.pincode}` : ""} | ${model.profile.lifestyle.household} | Goal: ${model.profile.lifestyle.savingsGoal}`);
    setText("#totalExpected", formatMoney(model.totalExpected));
    setText("#amountReceived", formatMoney(model.monthlySalary));
    setText("#pendingAmount", formatMoney(model.extraIncome));
    setText("#totalEmi", formatMoney(model.totalEmi));
    setText("#disposableIncome", formatMoney(model.disposableIncome));
    setText("#savingsProjection", formatMoney(model.savingsProjection));
    setText("#receivedCopy", `${percent(model.monthlySalary, model.totalExpected)} of expected income`);
    setText("#emiRatio", `${percent(model.totalEmi, model.totalExpected)} of income`);
    setText("#savingsRatio", `${percent(model.savingsProjection, model.totalExpected)} of expected income`);
  }

  function renderAlerts(model) {
    const alerts = [];
    if (model.totalEmi / model.totalExpected > 0.3) {
      alerts.push(["EMI due reminder", `EMIs consume ${percent(model.totalEmi, model.totalExpected)} of income. Keep the next payment funded before discretionary spends.`]);
    }
    if (model.extraIncome > model.totalExpected * 0.25) {
      alerts.push(["Extra income plan", `${formatMoney(model.extraIncome)} is outside monthly salary. Route a clear portion to savings before lifestyle spends.`]);
    }
    if (model.savingsProjection >= model.targetSavings) {
      alerts.push(["Savings milestone achieved", `${model.profile.lifestyle.savingsGoal} is on track with a ${percent(model.savingsProjection, model.targetSavings)} target run-rate.`]);
    }
    if (model.savingsProjection < model.targetSavings * 0.55) {
      alerts.push(["Low balance warning", `Projected savings are below the recommended buffer by ${formatMoney(model.targetSavings - model.savingsProjection)}.`]);
    }
    const entertainmentLimit = model.totalExpected * getBudgetPercent(model.adjustedBudget, "Entertainment") / 100;
    if ((model.categoryTotals.Entertainment || 0) > entertainmentLimit) {
      alerts.push(["Overspending alert", `Entertainment has crossed the ${formatMoney(entertainmentLimit)} city-adjusted guardrail.`]);
    }
    if (!alerts.length) {
      alerts.push(["Budget steady", "Income, spending, and savings are balanced for the current month."]);
    }

    document.querySelector("#alertStrip").innerHTML = alerts
      .slice(0, 3)
      .map(([title, body]) => `<article class="alert"><div><strong>${title}</strong><br>${body}</div></article>`)
      .join("");
  }

  function renderBudget(model) {
    setText("#cityChip", `${model.profile.city} cost index ${model.city.costIndex.toFixed(2)}x`);
    drawDoughnut(els.budgetDoughnut, budgetSplit);

    document.querySelector("#budgetBars").innerHTML = budgetSplit
      .map((item) => {
        const adjusted = getBudgetPercent(model.adjustedBudget, item.category);
        const amount = model.totalExpected * adjusted / 100;
        return `
          <div class="budget-row">
            <header>
              <span>${item.category}</span>
              <span>${item.percent}% base | ${adjusted}% city</span>
            </header>
            <div class="bar-track">
              <span class="bar-fill" style="width:${Math.min(adjusted, 40) * 2.5}%; background:${item.color}"></span>
            </div>
            <small>${formatMoney(amount)} suggested for ${model.profile.city}</small>
          </div>
        `;
      })
      .join("");

    const rentActual = model.profile.rent;
    const foodActual = (model.categoryTotals.Food || 0) + (model.categoryTotals.Grocery || 0);
    const entertainmentActual = model.categoryTotals.Entertainment || 0;
    const savingsActual = Math.max(0, model.savingsProjection);

    document.querySelector("#comparisonCards").innerHTML = [
      comparisonCard("Rent", rentActual, model.totalExpected * getBudgetPercent(model.adjustedBudget, "Rent") / 100),
      comparisonCard("Food + Grocery", foodActual, model.totalExpected * (getBudgetPercent(model.adjustedBudget, "Food") + getBudgetPercent(model.adjustedBudget, "Grocery")) / 100),
      comparisonCard("Entertainment", entertainmentActual, model.totalExpected * getBudgetPercent(model.adjustedBudget, "Entertainment") / 100),
      comparisonCard("Savings", savingsActual, model.targetSavings, true),
      comparisonCard("EMI Burden", model.totalEmi, model.totalExpected * 0.3),
      `<article class="mini-card"><span>City intelligence</span><strong>${model.profile.city}</strong><small>${model.city.transport}</small></article>`,
    ].join("");
  }

  function comparisonCard(label, actual, planned, higherIsGood) {
    const delta = actual - planned;
    const good = higherIsGood ? delta >= 0 : delta <= 0;
    const copy = good
      ? `${formatMoney(Math.abs(delta))} ${higherIsGood ? "above target" : "inside range"}`
      : `${formatMoney(Math.abs(delta))} ${higherIsGood ? "below target" : "over range"}`;
    return `<article class="mini-card"><span>${label}</span><strong>${formatMoney(actual)}</strong><small>${copy}</small></article>`;
  }

  function renderHealth(model) {
    const ring = document.querySelector("#scoreRing");
    const score = model.health.score;
    const degrees = Math.round(score * 3.6);
    const color = score >= 80 ? "#20b8a6" : score >= 60 ? "#2d9cdb" : score >= 40 ? "#f4a51c" : "#e85f5c";
    ring.style.background = `conic-gradient(${color} 0deg, ${color} ${degrees}deg, #e7edf3 ${degrees}deg 360deg)`;
    setText("#healthScore", score);
    setText("#healthLabel", model.health.label);
    document.querySelector("#scoreFactors").innerHTML = model.health.factors
      .map((factor) => `<div class="factor"><span>${factor.label}</span><span>${factor.value}</span></div>`)
      .join("");
  }

  function renderTransactions(model) {
    setText("#expenseTotalBadge", `${formatMoney(model.trackedExpenseTotal)} tracked`);
    const list = document.querySelector("#transactionList");
    if (!state.expenses.length) {
      list.innerHTML = `<article class="transaction"><div class="transaction-main"><strong>No expenses yet</strong><span>Add the first transaction above.</span></div></article>`;
      return;
    }

    list.innerHTML = [...state.expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((item) => `
        <article class="transaction" data-id="${item.id}">
          <div>
            <div class="transaction-main">
              <strong>${item.category}</strong>
              <strong>${formatMoney(item.amount)}</strong>
            </div>
            <span>${formatDate(item.date)}${item.note ? ` | ${escapeHtml(item.note)}` : ""}</span>
          </div>
          <div class="transaction-actions">
            <button class="icon-button" type="button" data-action="edit">Edit</button>
            <button class="icon-button" type="button" data-action="delete">Delete</button>
          </div>
        </article>
      `)
      .join("");

    list.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const row = button.closest(".transaction");
        const id = row.dataset.id;
        if (button.dataset.action === "edit") editExpense(id);
        if (button.dataset.action === "delete") deleteExpense(id);
      });
    });
  }

  function editExpense(id) {
    const item = state.expenses.find((expense) => expense.id === id);
    if (!item) return;
    els.expenseForm.editingId.value = item.id;
    els.expenseForm.amount.value = item.amount;
    els.expenseForm.category.value = item.category;
    els.expenseForm.date.value = item.date;
    els.expenseForm.note.value = item.note || "";
    els.expenseSubmit.textContent = "Update expense";
    els.expenseForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function deleteExpense(id) {
    state.expenses = state.expenses.filter((expense) => expense.id !== id);
    saveState();
    renderDashboard();
  }

  function renderInsights(model) {
    const insights = [];
    const entertainmentActual = model.categoryTotals.Entertainment || 0;
    const entertainmentLimit = model.totalExpected * getBudgetPercent(model.adjustedBudget, "Entertainment") / 100;
    const foodActual = (model.categoryTotals.Food || 0);

    if (entertainmentActual > entertainmentLimit) {
      const over = percent(entertainmentActual - entertainmentLimit, entertainmentLimit);
      insights.push(["danger", `Your entertainment spending is ${over} above the recommended range.`]);
    } else {
      insights.push(["good", `Entertainment is within range at ${percent(entertainmentActual, entertainmentLimit)} of the monthly guardrail.`]);
    }

    const diningMultiplier = { Rarely: 0.4, Weekly: 1, Frequently: 1.45, Daily: 2.1 }[model.profile.lifestyle.eatingOut] || 1;
    const diningOpportunity = Math.max(0, Math.round((foodActual * diningMultiplier - model.totalExpected * 0.05) / 100) * 100);
    if (diningOpportunity > 0) {
      insights.push(["caution", `You can save ${formatMoney(diningOpportunity)} more by reducing dining out frequency.`]);
    } else {
      insights.push(["good", `Dining spend is aligned with your ${model.profile.lifestyle.eatingOut.toLowerCase()} eating-out pattern.`]);
    }

    const emiShare = model.totalEmi / model.totalExpected;
    if (emiShare > 0.3) {
      insights.push(["danger", `EMIs consume ${percent(model.totalEmi, model.totalExpected)} of your income - consider lowering debt ratio.`]);
    } else {
      insights.push(["good", `EMI burden is controlled at ${percent(model.totalEmi, model.totalExpected)} of income.`]);
    }

    const shoppingSpend = model.categoryTotals.Shopping || 0;
    if (model.profile.lifestyle.shopping === "Frequent Shopper" && shoppingSpend < model.totalExpected * 0.04) {
      insights.push(["caution", `Shopping habits are marked frequent, but tracked shopping is low. Add missed purchases for a cleaner score.`]);
    }

    const rentShare = model.profile.rent / model.totalExpected * 100;
    if (rentShare > model.city.rentGuardrail) {
      insights.push(["caution", `Rent is ${Math.round(rentShare)}% of income in ${model.profile.city}; local guardrail is ${model.city.rentGuardrail}%.`]);
    }

    document.querySelector("#insightList").innerHTML = insights
      .slice(0, 5)
      .map(([type, text]) => `<article class="insight ${type === "danger" ? "danger" : type === "caution" ? "caution" : ""}">${text}</article>`)
      .join("");
  }

  function renderTrend(model) {
    const now = new Date();
    setText("#trendMonth", now.toLocaleString("en-IN", { month: "long", year: "numeric" }));
    drawTrend(els.trendChart, state.expenses, model.totalExpected);
  }

  function renderPlanner(model) {
    const today = new Date();
    const emiDate = new Date(today.getFullYear(), today.getMonth(), Math.min(28, today.getDate() + 4));
    const billDate = new Date(today.getFullYear(), today.getMonth(), Math.min(28, today.getDate() + 7));
    document.querySelector("#plannerList").innerHTML = [
      plannerItem("Upcoming EMI", formatMoney(model.totalEmi), formatDate(emiDate.toISOString().slice(0, 10))),
      plannerItem("Bills Due", formatMoney(model.profile.insurance + Math.round(model.totalExpected * 0.025)), formatDate(billDate.toISOString().slice(0, 10))),
      plannerItem("Extra Income", formatMoney(model.extraIncome), model.extraIncome ? "Allocate before spending" : "No extra income added"),
    ].join("");

    setText("#targetAmount", `${formatMoney(model.savingsProjection)} / ${formatMoney(model.targetSavings)}`);
    document.querySelector("#targetProgress").style.width = `${Math.min(100, Math.max(0, model.savingsProjection / model.targetSavings * 100))}%`;

    const goals = [
      ["Savings discipline", model.savingsProjection >= model.targetSavings],
      ["Expense tracking", state.expenses.length >= 8],
      ["EMI safety", model.totalEmi / model.totalExpected <= 0.3],
    ];
    document.querySelector("#goalGrid").innerHTML = goals
      .map(([label, done]) => `<article class="mini-card"><span>${done ? "Complete" : "Open"}</span><strong>${label}</strong><small>${done ? "Monthly goal completed" : "Needs attention this month"}</small></article>`)
      .join("");
  }

  function plannerItem(label, amount, meta) {
    return `<article class="planner-item"><strong>${label}</strong><span>${amount}<br>${meta}</span></article>`;
  }

  function resetApp() {
    state.profile = null;
    state.expenses = [];
    saveState();
    els.bottomTabbar.classList.remove("hidden");
    activateTab("profile");
    clearSetupForm();
    showSetup(1, { blank: true, activeTab: "home" });
  }

  function clearSetupForm() {
    els.setupForm.reset();
    populateStateDropdown();
    populateCityDropdown("");
    els.pinCode.setCustomValidity("");
    document.querySelectorAll(".choice-group").forEach((group) => {
      const first = group.querySelector(".choice-card");
      group.querySelectorAll(".choice-card").forEach((card) => card.classList.remove("active"));
      if (first) first.classList.add("active");
      syncChoiceGroup(group);
    });
    document.querySelectorAll(".amount-range").forEach((input) => {
      input.value = 0;
      updateAmountOutput(input);
    });
  }

  function syncChoiceGroup(group) {
    group.querySelectorAll(".choice-card").forEach((card) => {
      card.setAttribute("aria-pressed", card.classList.contains("active") ? "true" : "false");
    });
  }

  function updateAmountOutput(input) {
    const output = document.querySelector(`output[for="${input.id}"]`);
    if (output) output.textContent = formatMoney(input.value);
  }

  function getAdjustedBudget(cityName) {
    const shifts = getCityProfile(cityName).shifts;
    return budgetSplit.map((item) => ({
      ...item,
      adjustedPercent: Math.max(2, item.percent + (shifts[item.category] || 0)),
    }));
  }

  function getCityProfile(cityName) {
    return cityProfiles[cityName] || defaultCityProfile;
  }

  function getBudgetPercent(items, category) {
    const item = items.find((entry) => entry.category === category);
    return item ? item.adjustedPercent : 0;
  }

  function getCategoryTotals(expenses) {
    return expenses.reduce((acc, expense) => {
      const key = expense.category === "Utilities" ? "Electricity" : expense.category;
      acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    }, {});
  }

  function getExpenseDiscipline(totalExpected, totals, adjustedBudget) {
    const trackedCategories = ["Rent", "Food", "Grocery", "Electricity", "Entertainment"];
    const overages = trackedCategories.map((category) => {
      const actual = totals[category] || 0;
      const allowed = totalExpected * getBudgetPercent(adjustedBudget, category) / 100;
      return Math.max(0, actual - allowed);
    });
    return Math.max(0, 100 - Math.round(sum(overages) / totalExpected * 300));
  }

  function getHealthScore(model) {
    const savingsRatio = model.savingsProjection / model.totalExpected;
    const emiRatio = model.totalEmi / model.totalExpected;
    const savingsScore = clamp(Math.round(savingsRatio / 0.25 * 35), 0, 35);
    const emiScore = clamp(Math.round((1 - Math.max(0, emiRatio - 0.1) / 0.35) * 25), 0, 25);
    const balanceScore = clamp(Math.round(model.expenseDiscipline * 0.25), 0, 25);
    const disciplineScore = clamp(model.categoryTotals ? 15 : 8, 0, 15);
    const score = clamp(savingsScore + emiScore + balanceScore + disciplineScore, 0, 100);
    const label = score >= 80 ? "Excellent" : score >= 60 ? "Stable" : score >= 40 ? "Needs Attention" : "Critical";

    return {
      score,
      label,
      factors: [
        { label: "Savings ratio", value: `${Math.round(Math.max(0, savingsRatio) * 100)}%` },
        { label: "EMI burden", value: `${Math.round(emiRatio * 100)}%` },
        { label: "Expense balance", value: `${model.expenseDiscipline}/100` },
        { label: "Spending discipline", value: label },
      ],
    };
  }

  function drawDoughnut(canvas, data) {
    const ctx = prepCanvas(canvas, 260, 260);
    const total = sum(data, "percent");
    let start = -Math.PI / 2;
    const cx = canvas.width / getDpr() / 2;
    const cy = canvas.height / getDpr() / 2;
    const radius = 112;
    const lineWidth = 34;

    data.forEach((item) => {
      const angle = item.percent / total * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.strokeStyle = item.color;
      ctx.stroke();
      start += angle;
    });
  }

  function drawTrend(canvas, expenses, monthlyIncome) {
    const width = Math.max(680, canvas.parentElement.clientWidth - 36);
    const height = 280;
    const ctx = prepCanvas(canvas, width, height);
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const byDay = Array(daysInMonth).fill(0);
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        byDay[date.getDate() - 1] += expense.amount;
      }
    });

    const cumulativeExpense = [];
    byDay.reduce((running, amount, index) => {
      cumulativeExpense[index] = running + amount;
      return cumulativeExpense[index];
    }, 0);

    const incomeLine = byDay.map((_, index) => monthlyIncome / daysInMonth * (index + 1));
    const max = Math.max(monthlyIncome, ...cumulativeExpense) * 1.08;
    const padding = { left: 52, right: 18, top: 20, bottom: 36 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;
    const x = (i) => padding.left + (i / (daysInMonth - 1)) * plotW;
    const y = (value) => padding.top + plotH - (value / max) * plotH;

    ctx.strokeStyle = "#d9e3ee";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i += 1) {
      const yy = padding.top + (plotH / 4) * i;
      ctx.moveTo(padding.left, yy);
      ctx.lineTo(width - padding.right, yy);
    }
    ctx.stroke();

    ctx.fillStyle = "#607089";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("₹0", 12, y(0));
    ctx.fillText(formatCompact(max), 12, padding.top + 8);

    drawLine(ctx, incomeLine, x, y, "#20b8a6", 3);
    drawLine(ctx, cumulativeExpense, x, y, "#e85f5c", 3);

    ctx.fillStyle = "#102a54";
    ctx.font = "700 12px Inter, sans-serif";
    ctx.fillText("Income", width - 150, 24);
    ctx.fillStyle = "#20b8a6";
    ctx.fillRect(width - 172, 15, 12, 12);
    ctx.fillStyle = "#102a54";
    ctx.fillText("Expense", width - 78, 24);
    ctx.fillStyle = "#e85f5c";
    ctx.fillRect(width - 100, 15, 12, 12);
  }

  function drawLine(ctx, points, x, y, color, width) {
    ctx.beginPath();
    points.forEach((value, index) => {
      if (index === 0) ctx.moveTo(x(index), y(value));
      else ctx.lineTo(x(index), y(value));
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function prepCanvas(canvas, width, height) {
    const dpr = getDpr();
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return ctx;
  }

  function getDpr() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  function loadState() {
    try {
      const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return normalizeSavedState(removeGeneratedExpenses(savedState));
    } catch (error) {
      return null;
    }
  }

  function normalizeSavedState(savedState) {
    if (!savedState || !savedState.profile) return savedState;

    const profile = { ...savedState.profile };
    const inferredState = profile.state || inferStateFromCity(profile.city);
    if (inferredState && profile.state !== inferredState) profile.state = inferredState;
    if (!("pincode" in profile)) profile.pincode = "";

    const normalizedState = { ...savedState, profile };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
    return normalizedState;
  }

  function removeGeneratedExpenses(savedState) {
    if (!savedState || !Array.isArray(savedState.expenses)) return savedState;

    const expenses = savedState.expenses.filter((expense) => !["fixed", "sample"].includes(expense.source));
    if (expenses.length === savedState.expenses.length) return savedState;

    const cleanedState = { ...savedState, expenses };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedState));
    return cleanedState;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function formatMoney(value) {
    return rupee.format(Math.round(value || 0));
  }

  function formatCompact(value) {
    return new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  }

  function percent(value, total) {
    if (!total) return "0%";
    return `${Math.round(value / total * 100)}%`;
  }

  function toNumber(value) {
    return Math.max(0, Number(value) || 0);
  }

  function sum(items, key) {
    if (!Array.isArray(items)) return 0;
    if (!key) return items.reduce((total, value) => total + value, 0);
    return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char]);
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
})();
