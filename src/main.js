import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';

// API apuntando a tu backend en Render
const API = 'https://backend-r6e8.onrender.com/api';
console.log("🔗 Conectando a:", API);

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');

  // Elementos para el switch Login/Registro
  const formLogin = document.getElementById('form-login');
  const formRegistro = document.getElementById('form-registro');
  const tituloAuth = document.getElementById('titulo-auth');
  const linkIrRegistro = document.getElementById('link-ir-registro');
  const linkIrLogin = document.getElementById('link-ir-login');

  // --- PERSISTENCIA DE SESIÓN ---
  const usuarioGuardado = localStorage.getItem('usuario');
  if (usuarioGuardado) {
    const user = JSON.parse(usuarioGuardado);
    loginSection.classList.add('oculto');
    dashboardSection.classList.remove('oculto');
    document.getElementById('usuario-logueado').innerText = user.nombre;
    mostrarPanel('usuarios');
  }

  // ==========================================
  // 🔄 LÓGICA DE INTERCAMBIO (LOGIN <-> REGISTRO)
  // ==========================================
  if (linkIrRegistro) {
    linkIrRegistro.addEventListener('click', () => {
      formLogin.classList.add('oculto');
      formRegistro.classList.remove('oculto');
      tituloAuth.innerText = "Crear Cuenta Nueva";
    });
  }

  if (linkIrLogin) {
    linkIrLogin.addEventListener('click', () => {
      formRegistro.classList.add('oculto');
      formLogin.classList.remove('oculto');
      tituloAuth.innerText = "Acceso al Sistema";
    });
  }

  // ==========================================
  // 🔐 LOGIN
  // ==========================================
  formLogin?.addEventListener('submit', async e => {
    e.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    const clave = document.getElementById('login-clave').value.trim();
    
    if (!cedula || !clave) return Swal.fire('Error', 'Ingrese cédula y contraseña', 'warning');

    Swal.fire({ 
      title: 'Verificando...', 
      text: 'Conectando con el servidor...',
      allowOutsideClick: false, 
      didOpen: () => Swal.showLoading() 
    });

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, clave })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Credenciales incorrectas');

      Swal.fire({ icon: 'success', title: 'Bienvenido', text: data.usuario.nombre, timer: 1500, showConfirmButton: false });
      
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      loginSection.classList.add('oculto');
      dashboardSection.classList.remove('oculto');
      document.getElementById('usuario-logueado').innerText = data.usuario.nombre;
      mostrarPanel('usuarios');

    } catch (error) {
      Swal.fire('Error de Autenticación', error.message, 'error');
    }
  });

  // ==========================================
  // 📝 REGISTRO DE USUARIO
  // ==========================================
  formRegistro?.addEventListener('submit', async e => {
    e.preventDefault();
    const cedula = document.getElementById('reg-cedula').value.trim();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const clave = document.getElementById('reg-clave').value.trim();

    if (!cedula || !nombre || !clave) {
      return Swal.fire('Atención', 'Todos los campos son obligatorios', 'warning');
    }

    try {
      Swal.fire({ title: 'Registrando...', didOpen: () => Swal.showLoading() });

      // Enviamos los datos al mismo endpoint que usa el panel de administración
      const res = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, nombre, clave })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el usuario');

      // Registro exitoso
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada!',
        text: 'Tu usuario ha sido registrado. Ahora puedes iniciar sesión.',
        confirmButtonText: 'Ir al Login'
      }).then(() => {
        // Volver al formulario de login
        formRegistro.reset();
        linkIrLogin.click(); 
      });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message, 'error');
    }
  });

  // ==========================================
  // 🚪 LOGOUT
  // ==========================================
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    location.reload();
  });

  // ==========================================
  // 📊 GESTIÓN DE PANELES
  // ==========================================
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

    if(panel === 'usuarios') cargarUsuarios();
    if(panel === 'materias') cargarMaterias();
    if(panel === 'estudiantes') cargarEstudiantes();
    if(panel === 'notas') cargarNotas();
  }

  // ==========================================
  // 📡 FUNCIONES CRUD
  // ==========================================
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
    const tabla = document.getElementById('tabla-materias-body');
    if (!tabla) return;
    try {
      const res = await fetch(`${API}/materias`);
      const materias = await res.json();
      tabla.innerHTML = materias.map(m => `
        <tr>
          <td>#${m.id}</td>
          <td><span class="badge bg-secondary">${m.codigo}</span></td>
          <td>${m.nombre}</td>
        </tr>`).join('');
    } catch (err) { console.error("Error:", err); }
  }

  window.cargarEstudiantes = async () => {
    const tabla = document.getElementById('tabla-estudiantes-body');
    if (!tabla) return;
    try {
      const res = await fetch(`${API}/estudiantes`);
      const estudiantes = await res.json();
      tabla.innerHTML = estudiantes.map(e => `
        <tr>
          <td>#${e.id}</td>
          <td>${e.cedula}</td>
          <td>${e.nombre}</td>
        </tr>`).join('');
    } catch (err) { console.error("Error:", err); }
  }

  window.cargarNotas = async () => {
    const tabla = document.getElementById('tabla-notas-body');
    if (!tabla) return;
    try {
      const res = await fetch(`${API}/notas`);
      const notas = await res.json();
      tabla.innerHTML = notas.map(n => `
        <tr>
          <td>#${n.id}</td>
          <td>${n.estudiante}</td>
          <td>${n.materia}</td>
          <td><strong class="${n.nota >= 7 ? 'text-success' : 'text-danger'}">${n.nota}</strong></td>
        </tr>`).join('');
    } catch (err) { console.error("Error:", err); }
  }

  window.borrarUsuario = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
        Swal.fire('Eliminado', 'El usuario ha sido borrado', 'success');
        cargarUsuarios();
      } catch (err) { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
    }
  }
});
