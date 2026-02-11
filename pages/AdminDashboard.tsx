import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  activity: string;
  route: string;
  date: string;
  status: string;
  timestamp: string;
}

// Default dummy data if localStorage is empty
const defaultData: Reservation[] = [
  {
    id: 101,
    customerName: "John Doe",
    customerPhone: "+90 532 123 4567",
    activity: "Stand Up Paddle (SUP)",
    route: "Konyaaltı Loop",
    date: "2023-10-24",
    status: "Pending",
    timestamp: "2023-10-23T08:30:00Z"
  },
  {
    id: 102,
    customerName: "Alice Schmidt",
    customerPhone: "+49 170 987 6543",
    activity: "Sea Kayaking",
    route: "Blue Caves Tour",
    date: "2023-10-25",
    status: "Confirmed",
    timestamp: "2023-10-23T10:00:00Z"
  },
  {
    id: 103,
    customerName: "Marco Rossi",
    customerPhone: "+39 333 444 5566",
    activity: "Scuba Diving",
    route: "Wreck Site Exploration",
    date: "2023-10-26",
    status: "Completed",
    timestamp: "2023-10-23T20:00:00Z"
  }
];

const loadReservations = (): Reservation[] => {
  const storedData = localStorage.getItem('reservations');
  if (!storedData) {
    return defaultData;
  }

  try {
    const parsed = JSON.parse(storedData);
    return Array.isArray(parsed) ? parsed : defaultData;
  } catch {
    return defaultData;
  }
};

const AdminDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const loadedReservations = loadReservations();
    setReservations(loadedReservations);
    localStorage.setItem('reservations', JSON.stringify(loadedReservations));
  }, []);

  const handleDelete = (id: number) => {
    if(confirm('Are you sure you want to delete this reservation?')) {
      const updated = reservations.filter(r => r.id !== id);
      setReservations(updated);
      localStorage.setItem('reservations', JSON.stringify(updated));
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'bg-[#1183d4]/10 text-[#1183d4] border-[#1183d4]/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20'; // Pending
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f6f7f8] dark:bg-[#101a22]">
      {/* Admin Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#283239] bg-[#f6f7f8] dark:bg-[#101a22] px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-4 text-[#1183d4]">
            <div className="size-6">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">GET YOUR EXTREME</h2>
          </Link>
          <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#9dadb9] flex border-none bg-slate-200 dark:bg-[#283239] items-center justify-center pl-4 rounded-l-lg">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-slate-200 dark:bg-[#283239] focus:border-none h-full placeholder:text-[#9dadb9] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal" placeholder="Search reservations..." />
            </div>
          </label>
        </div>
        <div className="flex flex-1 justify-end gap-6">
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-200 dark:bg-[#283239] text-slate-900 dark:text-white hover:bg-[#1183d4]/20 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-200 dark:bg-[#283239] text-slate-900 dark:text-white hover:bg-[#1183d4]/20 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-[#283239]" 
            style={{backgroundImage: 'url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop")'}}
          ></div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Side Navigation */}
        <aside className="w-64 flex flex-col justify-between border-r border-[#283239] bg-[#f6f7f8] dark:bg-[#101a22] p-4 hidden lg:flex">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col px-3">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal">Admin Panel</h1>
              <p className="text-[#9dadb9] text-xs font-normal">Antalya Water Sports</p>
            </div>
            <nav className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1183d4] text-white cursor-pointer">
                <span className="material-symbols-outlined text-[22px]">dashboard</span>
                <p className="text-sm font-semibold">Dashboard</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9dadb9] hover:bg-slate-200 dark:hover:bg-[#283239] hover:text-white cursor-pointer transition-all">
                <span className="material-symbols-outlined text-[22px]">route</span>
                <p className="text-sm font-medium">Routes</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9dadb9] hover:bg-slate-200 dark:hover:bg-[#283239] hover:text-white cursor-pointer transition-all">
                <span className="material-symbols-outlined text-[22px]">image</span>
                <p className="text-sm font-medium">Gallery</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9dadb9] hover:bg-slate-200 dark:hover:bg-[#283239] hover:text-white cursor-pointer transition-all">
                <span className="material-symbols-outlined text-[22px]">storefront</span>
                <p className="text-sm font-medium">Shop</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9dadb9] hover:bg-slate-200 dark:hover:bg-[#283239] hover:text-white cursor-pointer transition-all mt-4 border-t border-[#283239] pt-6">
                <span className="material-symbols-outlined text-[22px]">group</span>
                <p className="text-sm font-medium">Customers</p>
              </div>
            </nav>
          </div>
          <div className="flex flex-col gap-4 p-3 bg-[#1183d4]/10 rounded-xl">
            <p className="text-xs text-[#1183d4] font-bold uppercase tracking-wider">System Status</p>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500"></div>
              <p className="text-slate-900 dark:text-white text-xs">All systems operational</p>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Heading Section */}
          <div className="flex flex-wrap justify-between items-end gap-3 p-8">
            <div className="flex min-w-72 flex-col gap-2">
              <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Reservations Management</p>
              <p className="text-[#9dadb9] text-base font-normal leading-normal">Manage and track all water sports booking requests in Antalya.</p>
            </div>
            <button className="bg-[#1183d4] hover:bg-[#1183d4]/80 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined">add</span>
              New Reservation
            </button>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-4 px-8 pb-4">
            <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-slate-600 dark:text-white text-base font-medium">Total Requests</p>
                <span className="material-symbols-outlined text-[#1183d4]">analytics</span>
              </div>
              <p className="text-slate-900 dark:text-white tracking-light text-3xl font-bold leading-tight">{reservations.length}</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#0bda5b] text-sm">trending_up</span>
                <p className="text-[#0bda5b] text-sm font-medium">Updated just now</p>
              </div>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-slate-600 dark:text-white text-base font-medium">Pending</p>
                <span className="material-symbols-outlined text-amber-500">pending_actions</span>
              </div>
              <p className="text-slate-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                {reservations.filter(r => r.status === 'Pending').length}
              </p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-500 text-sm">notifications</span>
                <p className="text-amber-500 text-sm font-medium">Action required</p>
              </div>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-slate-600 dark:text-white text-base font-medium">Est. Revenue</p>
                <span className="material-symbols-outlined text-emerald-500">payments</span>
              </div>
              <p className="text-slate-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                €{reservations.length * 50}
              </p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#0bda5b] text-sm">info</span>
                <p className="text-[#0bda5b] text-sm font-medium">Based on avg. price</p>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="px-8 mt-4">
            <div className="flex border-b border-slate-200 dark:border-[#3b4954] gap-8">
              <a className="flex flex-col items-center justify-center border-b-[3px] border-b-[#1183d4] text-[#1183d4] pb-[13px] pt-4" href="#">
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">All Reservations</p>
              </a>
              <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#9dadb9] hover:text-white pb-[13px] pt-4" href="#">
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Today</p>
              </a>
              <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#9dadb9] hover:text-white pb-[13px] pt-4" href="#">
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Upcoming</p>
              </a>
            </div>
          </div>

          {/* Data Table */}
          <div className="p-8">
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#1a262f] text-slate-600 dark:text-[#9dadb9] text-sm uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#283239] text-slate-900 dark:text-white text-sm">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-[#283239]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#1183d4]/20 flex items-center justify-center text-[#1183d4] font-bold">
                            {res.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{res.customerName}</p>
                            <p className="text-xs text-[#9dadb9]">{res.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{res.activity}</td>
                      <td className="px-6 py-4">{res.route}</td>
                      <td className="px-6 py-4">{res.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(res.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No reservations found.</td>
                     </tr>
                  )}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-slate-200 dark:border-[#283239] flex items-center justify-between">
                <p className="text-xs text-[#9dadb9]">Showing {reservations.length} reservations</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs border border-[#3b4954] rounded bg-transparent text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-[#283239]">Previous</button>
                  <button className="px-3 py-1 text-xs border border-[#3b4954] rounded bg-transparent text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-[#283239]">Next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
