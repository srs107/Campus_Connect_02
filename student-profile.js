const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) window.location.href = "index.html";

const role = currentUser.role;
if (role !== "student") {
  alert("Access restricted to students only.");
  if (role === "club") window.location.href = "club-dashboard.html";
  else if (role === "admin") window.location.href = "admin.html";
}

const profileForm = document.getElementById("profileForm");

if (profileForm) {
  profileForm.addEventListener("submit", e => {
    e.preventDefault();

    const profile = {
      name: document.getElementById("name").value,
      roll: document.getElementById("roll").value,
      dept: document.getElementById("dept").value,
      year: document.getElementById("year").value,
      dob: document.getElementById("dob").value,
      cgpa: document.getElementById("cgpa").value,
      internships: document.getElementById("internships").value,
      skills: document.getElementById("skills").value,
      interests: document.getElementById("interests").value,
      profilePic: ""
    };

    const file = document.getElementById("profilePic").files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        profile.profilePic = reader.result;
        saveProfile(profile);
      };
      reader.readAsDataURL(file);
    } else saveProfile(profile);
  });

  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  };
}

function saveProfile(profile) {
  const allProfiles = JSON.parse(localStorage.getItem("studentProfiles")) || {};
  allProfiles[currentUser.email] = profile;
  localStorage.setItem("studentProfiles", JSON.stringify(allProfiles));
  alert("Profile saved successfully!");
  window.location.href = "student-profile.html";
}

const profileCard = document.getElementById("profileCard");
if (profileCard) {
  const allProfiles = JSON.parse(localStorage.getItem("studentProfiles")) || {};
  const userProfile = allProfiles[currentUser.email];

  if (!userProfile) {
    window.location.href = "student-profile-setup.html";
  } else {
    document.getElementById("nameView").textContent = userProfile.name;
    document.getElementById("rollView").textContent = userProfile.roll;
    document.getElementById("deptView").textContent = userProfile.dept;
    document.getElementById("yearView").textContent = userProfile.year;
    document.getElementById("dobView").textContent = userProfile.dob;
    document.getElementById("cgpaView").textContent = userProfile.cgpa;
    document.getElementById("internshipsView").textContent = userProfile.internships;
    document.getElementById("skillsView").textContent = userProfile.skills;
    document.getElementById("interestsView").textContent = userProfile.interests;
    if (userProfile.profilePic)
      document.getElementById("profilePicView").src = userProfile.profilePic;
  }

  document.getElementById("editBtn").onclick = () => {
    window.location.href = "student-profile-setup.html";
  };
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  };
}

// Utility: get current student email (simulate login)
function getCurrentEmail() {
  return localStorage.getItem('currentEmail');
}

// Utility: get all profiles
function getProfiles() {
  return JSON.parse(localStorage.getItem('studentProfiles') || '{}');
}

// Utility: save all profiles
function saveProfiles(profiles) {
  localStorage.setItem('studentProfiles', JSON.stringify(profiles));
}

// Profile Setup Page Logic
if (document.getElementById('studentProfileForm')) {
  const form = document.getElementById('studentProfileForm');
  const photoInput = document.getElementById('profilePhoto');
  const photoPreview = document.getElementById('profilePhotoPreview');
  const toastContainer = document.getElementById('toastContainer');
  const email = getCurrentEmail();

  // Prefill if editing
  const profiles = getProfiles();
  if (profiles[email]) {
    Object.entries(profiles[email]).forEach(([key, value]) => {
      if (form.elements[key]) {
        if (key === "photo" && value) {
          photoPreview.src = value;
        } else {
          form.elements[key].value = value;
        }
      }
    });
  }

  // Photo preview
  photoInput.addEventListener('change', function() {
    const file = photoInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => photoPreview.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });

  // Save profile
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {};
    Array.from(form.elements).forEach(el => {
      if (el.name) data[el.name] = el.value;
    });
    // Save photo as base64
    if (photoPreview.src && photoPreview.src !== "default-avatar.png") {
      data.photo = photoPreview.src;
    }
    data.isCompleted = true;
    profiles[email] = data;
    saveProfiles(profiles);
    showToast("Profile saved!", "success");
    setTimeout(() => window.location.href = "home.html", 800);
  });

  // Reset
  document.getElementById('resetBtn').onclick = () => form.reset();

  // Cancel
  document.getElementById('cancelBtn').onclick = () => window.location.href = "home.html";

  // Toast
  function showToast(msg, type) {
    toastContainer.innerHTML = `<div class="toast ${type}">${msg}</div>`;
    setTimeout(() => toastContainer.innerHTML = "", 1500);
  }
}

// Edit Profile Button Logic (for home.html)
if (document.getElementById('editProfileBtn')) {
  document.getElementById('editProfileBtn').onclick = () => {
    window.location.href = "student-profile-setup.html";
  };
}

// Admin View Logic (for admin-student-profiles.html)
if (document.getElementById('adminProfilesGrid')) {
  const profiles = getProfiles();
  const grid = document.getElementById('adminProfilesGrid');
  grid.innerHTML = Object.values(profiles).map(profile => `
    <div class="admin-profile-card">
      <img src="${profile.photo || 'default-avatar.png'}" alt="Profile" class="admin-profile-photo">
      <h4>${profile.name}</h4>
      <p><strong>Roll:</strong> ${profile.rollNumber}</p>
      <p><strong>Dept:</strong> ${profile.department}</p>
      <p><strong>Year:</strong> ${profile.year}</p>
      <p><strong>Email:</strong> ${profile.email}</p>
      <p><strong>CGPA:</strong> ${profile.cgpa}</p>
      <p><strong>Internships:</strong> ${profile.internships}</p>
      <p><strong>Projects:</strong> ${profile.projects}</p>
      <p><strong>Skills:</strong> ${profile.skills}</p>
      <p><strong>Interests:</strong> ${profile.interests}</p>
      <p>
        ${profile.linkedin ? `<a href="${profile.linkedin}" target="_blank">LinkedIn</a>` : ""}
        ${profile.github ? `<a href="${profile.github}" target="_blank">GitHub</a>` : ""}
      </p>
    </div>
  `).join('');
}