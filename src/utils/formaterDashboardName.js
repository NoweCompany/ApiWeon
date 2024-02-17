export default function formaterNameDashboard(name) {
  return `dashboard_${(name.toLowerCase().trim()).split(' ').join('_')}`;
}
