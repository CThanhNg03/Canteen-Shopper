import "dotenv/config"; import { db } from "./index"; import { canteens,organizationUnits,mealTypes,tableTypes,dishes,ingredients } from "./schema";
const normalize=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").toLowerCase();
async function seed(){
  await db.insert(canteens).values([
    {name:"Căng tin Trung tâm",location:"Tòa nhà chính"},
    {name:"Căng tin Khu A",location:"Khu hành chính"},
    {name:"Căng tin Nhà thi đấu",location:"Khu thể thao"},
  ]).onConflictDoNothing();
  await db.insert(organizationUnits).values(["Phòng KT","Trọng tài","TCHCKT","QD34","C55"].map(name=>({name}))).onConflictDoNothing();
  await db.insert(mealTypes).values(["Sáng","Trưa","Chiều"].map((name,sortOrder)=>({name,sortOrder}))).onConflictDoNothing();
  await db.insert(tableTypes).values(["72K","128K"].map(name=>({name}))).onConflictDoNothing();
  const names=["Bò xào hoa thiên lý","Gà nấu lá giang","Thịt chiên lá mắc mật","Mướp đắng nhồi thịt","Rau muống luộc","Mướp hương xào giá","Canh bí xanh thịt","Chuối"];
  await db.insert(dishes).values(names.map(name=>({name,normalizedName:normalize(name),category:name.includes("Canh")?"Canh":name==="Chuối"?"Tráng miệng":name.includes("Rau")||name.includes("Mướp hương")?"Rau":"Món chính",status:"VERIFIED" as const}))).onConflictDoNothing();
  const ingredientNames=["Thịt bò","Thịt gà","Thịt vai","Cần tây","Hoa thiên lý","Lá giang","Mướp đắng","Rau muống","Mướp hương","Chuối"];
  await db.insert(ingredients).values(ingredientNames.map(name=>({name,unit:"kg",supplier:name.startsWith("Thịt")?"Thực phẩm An Phú":name==="Chuối"?"Nông sản Hòa Bình":"Rau củ Minh Tâm"}))).onConflictDoNothing();
}
seed().then(()=>{console.log("Đã tạo dữ liệu mẫu");process.exit(0)}).catch(e=>{console.error(e);process.exit(1)});
