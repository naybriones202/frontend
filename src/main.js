import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';

const API = 'https://backend-r6e8.onrender.com/api';

// ==========================================
// 1. CARGA DE DATOS (READ)
// ==========================================

window.cargarUsuarios = async () => {
    const res = await fetch(`${API}/usuarios`);
    const data = await res.json();
    document.getElementById('tabla-usuarios-body').innerHTML = data.map(u => `
        <tr><td>#${u.id}</td><td>${u.cedula}</td><td>${u.nombre}</td>
        <td class="text-center">
            <button class="btn btn-sm btn-outline-danger" onclick="borrarUsuario(${u.id})"><i class="bi bi-trash"></i></button>
        </td></tr>`).join('');
};

window.cargarMaterias = async () => {
    const res = await fetch(`${API}/materias`);
    const data = await res.json();
    document.getElementById('tabla-materias-body').innerHTML = data.map(m => `
        <tr><td>${m.id}</td><td>${m.codigo}</td><td>${m.nombre}</td>
        <td class="text-center">
            <button class="btn btn-sm btn-outline-warning me-1" onclick="editarMateria(${m.id}, '${m.codigo}', '${m.nombre}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="borrarMateria(${m.id})"><i class="bi bi-trash"></i></button>
        </td></tr>`).join('');
};

window.cargarEstudiantes = async () => {
    const res = await fetch(`${API}/estudiantes`);
    const data = await res.json();
    document.getElementById('tabla-estudiantes-body').innerHTML = data.map(e => `
        <tr><td>${e.id}</td><td>${e.cedula}</td><td>${e.nombre}</td>
        <td class="text-center">
            <button class="btn btn-sm btn-outline-warning me-1" onclick="editarEstudiante(${e.id}, '${e.cedula}', '${e.nombre}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="borrarEstudiante(${e.id})"><i class="bi bi-trash"></i></button>
        </td></tr>`).join('');
};

window.cargarNotas = async () => {
    const res = await fetch(`${API}/notas`);
    const data = await res.json();
    document.getElementById('tabla-notas-body').innerHTML = data.map(n => `
        <tr><td>${n.id}</td><td>${n.estudiante}</td><td>${n.materia}</td>
        <td><span class="badge ${n.nota >= 7 ? 'bg-success' : 'bg-danger'}">${n.nota}</span></td>
        <td class="text-center">
            <button class="btn btn-sm btn-outline-warning me-1" onclick="editarNota(${n.id}, ${n.nota})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="borrarNota(${n.id})"><i class="bi bi-trash"></i></button>
        </td></tr>`).join('');
};

// ==========================================
// 2. FUNCIONES DE EDICIÓN (UPDATE)
// ==========================================

window.editarMateria = async (id, cod, nom) => {
    const { value: formValues } = await Swal.fire({
        title: 'Editar Materia',
        html: `<input id="sw-cod" class="swal2-input" value="${cod}" placeholder="Código">
               <input id="sw-nom" class="swal2-input" value="${nom}" placeholder="Nombre">`,
        showCancelButton: true,
        preConfirm: () => ({ codigo: document.getElementById('sw-cod').value, nombre: document.getElementById('sw-nom').value })
    });
    if (formValues) {
        await fetch(`${API}/materias/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(formValues) });
        window.cargarMaterias();
    }
};

window.editarEstudiante = async (id, ced, nom) => {
    const { value: formValues } = await Swal.fire({
        title: 'Editar Estudiante',
        html: `<input id="sw-ced" class="swal2-input" value="${ced}" placeholder="Cédula">
               <input id="sw-nom" class="swal2-input" value="${nom}" placeholder="Nombre">`,
        showCancelButton: true,
        preConfirm: () => ({ cedula: document.getElementById('sw-ced').value, nombre: document.getElementById('sw-nom').value })
    });
    if (formValues) {
        await fetch(`${API}/estudiantes/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(formValues) });
        window.cargarEstudiantes();
    }
};

window.editarNota = async (id, notaActual) => {
    const { value: nuevaNota } = await Swal.fire({
        title: 'Actualizar Nota',
        input: 'number',
        inputAttributes: { min: 0, max: 10, step: 0.1 },
        inputValue: notaActual,
        showCancelButton: true
    });
    if (nuevaNota) {
        await fetch(`${API}/notas/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ nota: nuevaNota }) });
        window.cargarNotas();
    }
};

// ==========================================
// 3. FUNCIONES DE ELIMINACIÓN (DELETE)
// ==========================================

const eliminarEntidad = async (ruta, id, callback) => {
    const result = await Swal.fire({ title: '¿Estás seguro?', text: "Esta acción no se puede deshacer", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar' });
    if (result.isConfirmed) {
        await fetch(`${API}/${ruta}/${id}`, { method: 'DELETE' });
        callback();
    }
};

window.borrarUsuario = (id) => eliminarEntidad('usuarios', id, window.cargarUsuarios);
window.borrarMateria = (id) => eliminarEntidad('materias', id, window.cargarMaterias);
window.borrarEstudiante = (id) => eliminarEntidad('estudiantes', id, window.cargarEstudiantes);
window.borrarNota = (id) => eliminarEntidad('notas', id, window.cargarNotas);

// ==========================================
// 4. LÓGICA DE INTERFAZ Y MODALES
// ==========================================

window.mostrarPanel = (panel) => {
    document.querySelectorAll('.table-container').forEach(p => p.classList.add('oculto'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(`panel-${panel}`).classList.remove('oculto');
    const titulos = { usuarios: 'Usuarios', materias: 'Materias', estudiantes: 'Estudiantes', notas: 'Notas' };
    document.getElementById('titulo-seccion').innerText = titulos[panel];

    if(panel === 'usuarios') window.cargarUsuarios();
    if(panel === 'materias') window.cargarMaterias();
    if(panel === 'estudiantes') window.cargarEstudiantes();
    if(panel === 'notas') window.cargarNotas();
};

window.prepararFormNota = async () => {
    const [resEst, resMat] = await Promise.all([fetch(`${API}/estudiantes`), fetch(`${API}/materias`)]);
    const ests = await resEst.json();
    const mats = await resMat.json();
    
    document.getElementById('nota-estudiante').innerHTML = ests.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
    document.getElementById('nota-materia').innerHTML = mats.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
};

// ==========================================
// 5. EVENTOS INICIALES
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // --- LOGIN ---
    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = { cedula: document.getElementById('login-cedula').value, clave: document.getElementById('login-clave').value };
        const res = await fetch(`${API}/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
        const data = await res.json();
        if (res.ok) { localStorage.setItem('usuario', JSON.stringify(data.usuario)); location.reload(); }
        else { Swal.fire('Error', data.msg, 'error'); }
    });

    // --- REGISTRO USUARIO ---
    document.getElementById('form-registro').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = { 
            cedula: document.getElementById('reg-cedula').value, 
            nombre: document.getElementById('reg-nombre').value, 
            clave: document.getElementById('reg-clave').value 
        };
        const res = await fetch(`${API}/usuarios`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
        if (res.ok) { Swal.fire('Éxito', 'Usuario creado', 'success'); location.reload(); }
    });

    // --- GUARDAR NUEVA MATERIA ---
    document.getElementById('form-materia').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = { codigo: document.getElementById('mat-codigo').value, nombre: document.getElementById('mat-nombre').value };
        await fetch(`${API}/materias`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
        bootstrap.Modal.getInstance(document.getElementById('modalMateria')).hide();
        window.cargarMaterias();
    });

    // --- GUARDAR NUEVO ESTUDIANTE ---
    document.getElementById('form-estudiante').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = { cedula: document.getElementById('est-cedula').value, nombre: document.getElementById('est-nombre').value };
        await fetch(`${API}/estudiantes`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
        bootstrap.Modal.getInstance(document.getElementById('modalEstudiante')).hide();
        window.cargarEstudiantes();
    });

    // --- GUARDAR NUEVA NOTA ---
    document.getElementById('form-nota').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = { 
            estudiante_id: document.getElementById('nota-estudiante').value, 
            materia_id: document.getElementById('nota-materia').value, 
            nota: document.getElementById('nota-valor').value 
        };
        await fetch(`${API}/notas`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
        bootstrap.Modal.getInstance(document.getElementById('modalNota')).hide();
        window.cargarNotas();
    });

    // --- SESIÓN Y LOGOUT ---
    const user = localStorage.getItem('usuario');
    if (user) {
        document.getElementById('login-section').classList.add('oculto');
        document.getElementById('dashboard-section').classList.remove('oculto');
        document.getElementById('usuario-logueado').innerText = JSON.parse(user).nombre;
        window.mostrarPanel('usuarios');
    }

    document.getElementById('btn-logout').onclick = () => { localStorage.clear(); location.reload(); };
    document.getElementById('link-ir-registro').onclick = () => { document.getElementById('form-login').classList.add('oculto'); document.getElementById('form-registro').classList.remove('oculto'); };
    document.getElementById('link-ir-login').onclick = () => { document.getElementById('form-registro').classList.add('oculto'); document.getElementById('form-login').classList.remove('oculto'); };
});
