class UserController {

    constructor(formId, formUpdate, tableId){
        this.formEl = document.getElementById(formId);
        this.formUpdateEl = document.getElementById(formUpdate);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEdit();
        this.selectAllFromStorage();
    }

    selectAllFromStorage(){
        let users = User.getUsersStorage();

        users.forEach(dataUsers=>{
            let user = new User();
            user.loadFromJSON(dataUsers);

            this.addLine(user);
        });
    }
    
    addLine(dataUser){//function that append into the table
        
        let tr = document.createElement("tr");
    
        this.getTr(tr,dataUser);

        this.addEventTr(tr);
    
        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(tr, dataUser){
        tr.dataset.user = JSON.stringify(dataUser);//serializa o objeto no formato JSON.
        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin)? "Sim" : "Não"}</td>
            <td>${dataUser.register.toLocaleDateString()}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;
    }

    addEventTr(tr){//add event to the tr which is beeing created/updated
        tr.querySelector(".btn-delete").addEventListener("click", e=>{
            if(confirm("Deseja realmente excluir?")){
                let user = new  User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove();
                tr.remove();
            }
            this.updateCount();
        });

        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector("#form-user-update")
            
            form.dataset.trIndex = tr.sectionRowIndex;

            for(let name in json){

                let field = form.querySelector("[name=" + name.replace("_","") + "]");

                if(field){

                    if(field.type == 'file'){

                        continue;

                    }else if(field.type == 'radio'){

                        field = form.querySelector("[name=" + name.replace("_","") + "]" + "[value=" + json[name] + "]");
                        field.checked = true;

                    }else if(field.type=='checkbox'){

                        field.checked = json[name]

                    }else{

                        field.value = json[name];

                    }

                }
            }
            
            this.showPanelUpdate();

        });
    }

    showPanelCreate(){

        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";

    }
    showPanelUpdate(){

        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";

    }

    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr=>{

            numberUsers++;

            let users = JSON.parse(tr.dataset.user);
            if(users._admin) numberAdmin++;

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-admin").innerHTML = numberAdmin;
        
    }
    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener('submit', event => {
            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({},userOld, values);
            
            this.getPhoto(this.formUpdateEl).then(
                (content)=>{//caso a promise retornar um result

                    if(!values._photo){
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }
                    
                    let user = new User();
                    user.loadFromJSON(result);
                    user.save();

                    this.getTr(tr,user);//adiciona as informações à tr
                    this.addEventTr(tr);
                    this.formUpdateEl.reset();
                    btn.disabled = false;
                    this.updateCount();
                    this.showPanelCreate();
                },
                (error)=>{//caso a promise retornar um reject
                    console.error(error);
                }
            );
        });

    }

    onSubmit(){
        this.formEl.addEventListener("submit", (event) => {//adding event to get data from the form
            //Obs.:  the arrow function doesn't change the escope
            event.preventDefault();//so the navigator don't refresh
            
            let values = this.getValues(this.formEl);
            if(!values){//srá falso se um dos campos do form estiver vazio
                return false;
            }
            let btnSubmit = this.formEl.querySelector("[type=submit]");
            btnSubmit.disabled = true;

            this.getPhoto(this.formEl).then(
                (content)=>{//caso a promise retornar um result]

                    values.photo = content;
                    values.save();//adiciona o objeto à memória local
                    this.addLine(values); //por causa desse 'this.' precisei usar arrow function (ñ mudar escopo)
                    this.formEl.reset();
                    btnSubmit.disabled = false;
                },
                (error)=>{//caso a promise retornar um reject
                    console.error(error);
                }
            );

        });
    }

    getPhoto(formEl){
        //promise é uma classe (precisa ser instânciada)
        return new Promise((resolve, reject)=>{//usei arrow function para não mudar o escopo do algoritmo
            let fileReader = new FileReader();//API para leitura de arquivos

            let elements = [...formEl.elements].filter(item=>{//filtra o array para selecionar um conteúdo específico
    
                if(item.name === 'photo'){
                    return item;//retorna apenas a 'arrow function' e armazena o 'item' no array 'elements'.
                }
    
            });
    
            let file = elements[0].files[0];
    
            fileReader.onload  = ()=>{
    
                resolve(fileReader.result); //passa o resultado do fileReader como parâmetro da função callback
    
            };

            fileReader.onerror = (e)=>{

                reject(e);

            }
            if(file){
                fileReader.readAsDataURL(file);//ao acabar de ler o arquivo, chamará a função acima (fileReader.onload);
            }else{
                resolve("dist/img/boxed-bg.jpg");
            }
        });
    }

    getValues(formEl){
        
        let user = {};
        let isValid = true;

        [...formEl.elements].forEach(function(field, index){//get the values from the form
        //the operator '...' (spread), puts each element of an object into an array.
            let classElement = field.parentElement.classList;
            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){

                classElement.add('has-error');
                isValid = false;
            } else if(classElement.contains('has-error')){
                classElement.remove('has-error');
            }

            
            if(field.name == 'gender'){
                if(field.checked){
                    user[field.name] = field.value;
                }
            }else if(field.name == 'admin') {
                user[field.name] = field.checked ? true : false;
            }else{
                user[field.name] = field.value;
            }
        });
        
        if(!isValid){
            return false;
        } else {
            return new User(
                user.name,
                user.gender,
                user.birth,
                user.country,
                user.email,
                user.password,
                user.photo,
                user.admin
            ); 
        }
        

    }
}