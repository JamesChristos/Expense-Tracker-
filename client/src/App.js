import './App.css';
import React, { useMemo } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Orb from './components/Orbs';
import Record from './pages/Record';
import Test from './pages/Test';
import Loginside from './components/loginSide';
import RegisterSide from './components/registerSide';
import ForgotSide from './components/forgotSide';
import Set_Budget from './pages/Set-budgets';
import Export from './pages/Export';
import Plan from './pages/Plan';
import Resetside from './components/resetSide';
import Goal from './pages/Goal';

function App() {
  const orbMemo = useMemo(() => {
    return <Orb />;
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<ProtectedRoute><Record /></ProtectedRoute>} />
          <Route path='/test' element={<Test />} />
          <Route path='/login' element={<Loginside />} />
          <Route path='/register' element={<RegisterSide />} />
          <Route path='/forget-password' element={<ForgotSide />} />
          <Route path="/reset-password/:id/:token" element={<Resetside />} />
          <Route path='/Set-budget' element={<Set_Budget />} />
          <Route path='/export' element={<Export />} />
          <Route path='/plan' element={<Plan />} />
          <Route path='/goals' element={<Goal />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export function ProtectedRoute(props) {
  if (localStorage.getItem('users')) {
    return props.children;
  } else {
    return <Navigate to='/login' />;
  }
} 

export default App;
