class User {
    
    constructor(name, gender, birth, country, email, password, photo, admin){
        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();
    }

    get id(){
        return this._id;
    }
    get name(){
        return this._name;
    }
    get gender(){
        return this._gender;
    }
    get birth(){
        return this._birth;
    }
    get country(){
        return this._country;
    }
    get email(){
        return this._email;
    }
    get password(){
        return this._password;
    }
    get photo(){
        return this._photo;
    }
    set photo(foto){
        this._photo = foto;
    }
    get admin(){
        return this._admin;
    }
    get register(){
        return this._register;
    }
    loadFromJSON(json){
        for (let name in json){

            if(name == '_register'){
                this[name] = new Date(json[name]);
            }else{
                this[name] = json[name];
            }
        }
    }
    getNewId(){//cria ou incrementa o id no escopo da janela
        let usersId = parseInt(localStorage.getItem("usersID"));

        if(!(usersId>0)) usersId = 0;
        usersId++;
        
        localStorage.setItem("usersID",usersId);
        return usersId;
    }

    static getUsersStorage(){
        let users = [];

        if(localStorage.getItem("users")){
            users = JSON.parse(localStorage.getItem("users"));
        }

        return users;
    }


    save(){
        let users = User.getUsersStorage();
        console.log(this.id);
        if(this.id > 0){

            users.map(us=>{
                if(us._id == this.id){
                    Object.assign(us,this);
                }
                return us;
            });

        } else {
            this._id = this.getNewId();
            users.push(this);
        }
        
        localStorage.setItem("users",JSON.stringify(users));
    }

    remove(){
        let users = User.getUsersStorage();
        users.forEach((us,index)=> {
            if(us._id == this.id){
                users.splice(index, 1)//exclui apenas 1 elemento a partir do ídice dado
            }
        });
        localStorage.setItem("users",JSON.stringify(users));
    }
}