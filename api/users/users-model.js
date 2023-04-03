const db = require("../../data/db-config");

/**
  tüm kullanıcıları içeren bir DİZİ ye çözümlenir, tüm kullanıcılar { user_id, username } içerir
 */
async function bul() {
  allUsers = await db("users");
  allUserModel = allUsers.map(user => ({user_id: user.user_id,username: user.username}))
  return allUserModel;
}

/**
  verilen filtreye sahip tüm kullanıcıları içeren bir DİZİ ye çözümlenir
 */
async function goreBul(filtre) {
  const filteredUsers = await db("users").where(filtre);
  return filteredUsers;
}

/**
  verilen user_id li kullanıcıya çözümlenir, kullanıcı { user_id, username } içerir
 */
async function idyeGoreBul(user_id) {
  const user = await db("users").where("user_id", user_id).first();
  const userModel = {user_id: user.user_id, username: user.username};
  return userModel;
}

/**
  yeni eklenen kullanıcıya çözümlenir { user_id, username }
 */
async function ekle(user) {
  const [id] = await db("users").insert(user);
  return await idyeGoreBul(id);
}

// Diğer modüllerde kullanılabilmesi için fonksiyonları "exports" nesnesine eklemeyi unutmayın.

module.exports = {
  bul,
  goreBul,
  idyeGoreBul,
  ekle,
};
