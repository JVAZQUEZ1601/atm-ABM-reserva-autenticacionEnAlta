/* ---------------------------------------------------
 *  Módulo único para las tres páginas                *
 * --------------------------------------------------- */
const STORAGE_KEY = 'registrosUsuario';
let editIndex = null, deleteIndex = null, pendingIndex = null;

/* ---------- API localStorage ---------- */
const obtener = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
const guardar = arr => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

/* ---------- Utilidad estado ---------- */
const calcEstado = fh=>{
  if(!fh) return {txt:'',cls:''};
  const hoy = new Date();
  const fhd = new Date(`${fh}T00:00:00`);
  return (fhd < hoy.setHours(0,0,0,0))
      ? {txt:'LIBRE',cls:'estado-libre'}
      : {txt:'OCUPADO',cls:'estado-ocupado'};
};

/* ---------- Elementos DOM ---------- */
const f      = document.getElementById('registroForm');
const tbody  = document.querySelector('#tablaHistorial tbody');
const cards  = document.getElementById('tarjetasContainer');

const fechaInp      = document.getElementById('fechaHasta');
const estadoInp     = document.getElementById('estado');
const submitBtn     = document.getElementById('submitBtn');
const confirmDelBtn = document.getElementById('confirmDeleteBtn');

const modal      = document.getElementById('authModal');
const authUser   = document.getElementById('authUser');
const authPass   = document.getElementById('authPass');
const authOk     = document.getElementById('authOk');
const authCancel = document.getElementById('authCancel');
const authError  = document.getElementById('authError');

const nombre       = document.getElementById('nombre');
const apellido     = document.getElementById('apellido');
const marcaInp     = document.getElementById('marca');
const modeloInp    = document.getElementById('modelo');
const softwareInp  = document.getElementById('software');
const reservadoPor = document.getElementById('reservadoPor');
const imagen       = document.getElementById('imagen');

/* ---------- Eventos de formulario ---------- */
fechaInp.addEventListener('change',()=>{ estadoInp.value = calcEstado(fechaInp.value).txt; });

f.addEventListener('submit',e=>{
  e.preventDefault();
  const r = {
    nombre      : nombre.value.trim(),
    apellido    : apellido.value.trim(),
    marca       : marcaInp.value.trim(),
    modelo      : modeloInp.value.trim(),
    software    : softwareInp.value.trim(),
    reservadoPor: reservadoPor.value.trim(),
    fechaHasta  : fechaInp.value,
    imagen      : imagen.value,
  };
  r.estado = calcEstado(r.fechaHasta).txt;

  const datos = obtener();
  editIndex === null ? datos.push(r) : datos.splice(editIndex,1,r);
  guardar(datos);

  resetForm();
  render();
});

confirmDelBtn.addEventListener('click',()=>{
  if(deleteIndex===null) return;
  const datos = obtener();
  const {nombre,apellido} = datos[deleteIndex];
  if(confirm(`¿Eliminar el registro de ${nombre} ${apellido}?`)){
    datos.splice(deleteIndex,1);
    guardar(datos);
    resetForm();
    render();
  }
});

/* ---------- Renderización ---------- */
function renderTabla(){
  const datos = obtener();
  tbody.innerHTML='';
  datos.forEach((r,i)=>{
    const est = calcEstado(r.fechaHasta);
    tbody.insertAdjacentHTML('beforeend',`
      <tr>
        <td>${i+1}</td><td>${r.nombre}</td><td>${r.apellido}</td>
        <td>${r.marca}</td><td>${r.modelo}</td><td>${r.software}</td>
        <td>${r.reservadoPor}</td><td>${r.fechaHasta}</td>
        <td class="${est.cls}">${est.txt}</td>
        <td>
          <button class="eliminar-btn" data-del="${i}">Eliminar</button>
          <button class="editar-btn"   data-edit="${i}">Editar</button>
        </td>
      </tr>`);
  });
}

function renderCards(){
  const datos = obtener();
  cards.innerHTML='';
  datos.forEach((r,i)=>{
    const est = calcEstado(r.fechaHasta);
    cards.insertAdjacentHTML('beforeend',`
      <div class="tarjeta">
        <button class="btn-card editar-btn" data-edit="${i}">Editar</button>
        <img src="img/${r.imagen}" alt="Foto">
        <p><strong>ID:</strong> ${r.nombre}</p>
        <p><strong>IP:</strong> ${r.apellido}</p>
        <p><strong>MARCA:</strong> ${r.marca}</p>
        <p><strong>MODELO:</strong> ${r.modelo}</p>
        <p><strong>SOFTWARE:</strong> ${r.software}</p>
        <p><strong>Reservado por:</strong> ${r.reservadoPor}</p>
        <p><strong>Fecha hasta:</strong> ${r.fechaHasta}</p>
        <p><strong>Estado:</strong> <span class="${est.cls}">${est.txt}</span></p>
        <button class="btn-card eliminar-btn el-card" data-del="${i}">Eliminar</button>
      </div>`);
  });
}

function render(){ renderTabla(); renderCards(); }

/* ---------- Delegación de eventos ---------- */
cards.addEventListener('click',e=>{
  if(e.target.dataset.edit !== undefined) cargar(e.target.dataset.edit,false);
  else if(e.target.dataset.del !== undefined) autenticar(e.target.dataset.del);
});
tbody.addEventListener('click',e=>{
  if(e.target.dataset.del !== undefined) autenticar(e.target.dataset.del);
  else if(e.target.dataset.edit !== undefined) cargar(e.target.dataset.edit,false);
});

/* ---------- Autenticación ---------- */
function autenticar(idx){
  pendingIndex = idx;
  modal.classList.add('active');
  authUser.value=''; authPass.value=''; authError.textContent=''; authUser.focus();
}
authOk.addEventListener('click',()=>{
  if(authUser.value==='admin' && authPass.value==='1234'){
    hideModal();
    cargar(pendingIndex,true);
    pendingIndex=null;
  }else authError.textContent='Credenciales incorrectas';
});
authCancel.addEventListener('click',hideModal);
modal.addEventListener('click',e=>{ if(e.target===modal) hideModal(); });
function hideModal(){ modal.classList.remove('active'); }

/* ---------- Cargar registro en formulario ---------- */
function cargar(i,modoEliminar=false){
  const r = obtener()[i];
  nombre.value       = r.nombre;
  apellido.value     = r.apellido;
  marcaInp.value     = r.marca;
  modeloInp.value    = r.modelo;
  softwareInp.value  = r.software;
  reservadoPor.value = r.reservadoPor;
  fechaInp.value     = r.fechaHasta;
  estadoInp.value    = calcEstado(r.fechaHasta).txt;
  imagen.value       = r.imagen;

  editIndex = i;

  if(modoEliminar){
    deleteIndex = i;
    confirmDelBtn.disabled=false;
  }else{
    deleteIndex = null;
    confirmDelBtn.disabled=true;
  }
  submitBtn.textContent='Actualizar';
  f.scrollIntoView({behavior:'smooth'});
}

/* ---------- Reset ---------- */
function resetForm(){
  f.reset();
  estadoInp.value='';
  editIndex = deleteIndex = null;
  submitBtn.textContent='Guardar';
  confirmDelBtn.disabled=true;
}

/* ---------- Sincronización entre pestañas ---------- */
window.addEventListener('storage',e=>{
  if(e.key===STORAGE_KEY) render();
});

/* ---------- Inicio ---------- */
document.addEventListener('DOMContentLoaded',render);
