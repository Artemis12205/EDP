// Demo data only. Replace these arrays with database queries before deployment.

const projects = [
  {
    id: 1,
    name: "Maasin HealthLine",
    description: "AI-integrated health center appointment and information management system"
  }
];

const appointments = [
  {
    id: 1,
    patientName: "Sample Patient",
    serviceId: 1,
    appointmentDate: "2026-10-20",
    time: "09:00",
    reason: "General consultation",
    status: "Pending"
  }
];

const patients = [
  {
    id: 1,
    fullName: "Sample Patient",
    dateOfBirth: "2000-01-15",
    contactNumber: "09123456789",
    address: "Sample address"
  }
];

const services = [
  {
    id: 1,
    name: "General Consultation",
    description: "General health consultation",
    requirements: "Bring any applicable health records",
    available: true
  }
];

const healthInformation = [
  {
    id: 1,
    title: "How to Request an Appointment",
    category: "Appointments",
    content: "Choose a service, select an available date and time, and submit the appointment request."
  }
];

module.exports = {
  projects,
  appointments,
  patients,
  services,
  healthInformation
};