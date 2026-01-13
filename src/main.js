import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';

const API = 'https://backend-r6e8.onrender.com/api';

// ==========================================
// 1. DEFINIR FUNCIONES GLOBALES (MOVER ESTO AL INICIO)
// ==========================================

// Definimos las funciones de carga de datos primero
window.cargarUsuarios = async () => {
  const tabla = document.getElementById('tabla-usuarios-body');
  if (!tabla) return;
  try {
    const res = await fetch(`${API}/usuarios`);
    const usuarios = await res.json();
    tabla.innerHTML = usuarios.map(u => `
      <tr>
        <td>#${u.id}</td>
        <td>${u.cedula}</td>
        <td>${u.nombre}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-danger" onclick="borrarUsuario(${u.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`).join('');
  } catch (err) { console.error("Error:", err); }
}

window.cargarMaterias = async () => {
    // ... (Tu código de cargarMaterias aquí) ...
    // Copia el contenido exacto que tenías abajo
}

window.cargarEstudiantes = async () => {
    // ... (Tu código de cargarEstudiantes aquí) ...
}

window.cargarNotas = async () => {
    // ... (Tu código de cargarNotas aquí) ...
}

window.borrarUsuario = async (id) => {
    // ... (Tu código de borrarUsuario aquí) ...
}

// Definimos mostrarPanel (ahora que las funciones de carga existen)
window.mostrarPanel = (panel) => {
  const secciones = ['usuarios','materias','estudiantes','notas'];
  secciones.forEach(p => {
    const el = document.getElementById(`panel-${p}`);
    if (el) el.classList.add('oculto');
  });
  
  const panelActivo = document.getElementById(`panel-${panel}`);
  if (panelActivo) panelActivo.classList.remove('oculto');

  const titulos = {
    usuarios: 'Gestión de Usuarios',
    materias: 'Gestión de Materias',
    estudiantes: 'Directorio de Estudiantes',
    notas: 'Registro de Notas'
  };
  
  const tituloDoc = document.getElementById('titulo-seccion');
  if (tituloDoc) tituloDoc.innerText = titulos[panel] || 'Panel';

  if(panel === 'usuarios') window.cargarUsuarios(); // Usar window. para asegurar
  if(panel === 'materias') window.cargarMaterias();
  if(panel === 'estudiantes') window.cargarEstudiantes();
  if(panel === 'notas') window.cargarNotas();
}


// ==========================================
// 2. AHORA SÍ, LA LÓGICA DEL DOM
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');

  // --- PERSISTENCIA DE SESIÓN ---
  const usuarioGuardado = localStorage.getItem('usuario');
  
  if (usuarioGuardado) {
    const user = JSON.parse(usuarioGuardado);
    loginSection.classList.add('oculto');
    dashboardSection.classList.remove('oculto');
    document.getElementById('usuario-logueado').innerText = user.nombre;
    
    // AHORA ESTO FUNCIONARÁ PORQUE LA FUNCIÓN YA FUE LEÍDA ARRIBA
    window.mostrarPanel('usuarios'); 
  }

  // ... El resto de tus EventListeners (Login, Registro, Logout) van aquí ...
});
