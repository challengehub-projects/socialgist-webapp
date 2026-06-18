import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";
import {
  FiEdit2,
  FiCheck,
  FiCamera,
  FiRefreshCw,
  FiArrowLeft,
} from "react-icons/fi";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

export default function SeetingsPage() {

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  // ================= FETCH =================
  useEffect(() => {

    const fetchProfile = async () => {

      try {

        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();


        if (!user) {
          setProfile(null);
          return;
        }


        const cacheKey = `profile-${user.id}`;

        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          setProfile(JSON.parse(cached));
        }


        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();


        if (error) {
          console.error(error);
          return;
        }


        let updatedProfile = {
          ...data,
        };


        // create username if missing
        if (!updatedProfile.username) {

          const username =
            `user_${nanoid(6)}`;


          await supabase
            .from("profiles")
            .update({
              username,
            })
            .eq("id", user.id);


          updatedProfile.username = username;
        }


        setProfile(updatedProfile);


        sessionStorage.setItem(
          cacheKey,
          JSON.stringify(updatedProfile)
        );


      } catch(err){

        console.error(err);

      } finally {

        setLoading(false);

      }
    };


    fetchProfile();


    const {
      data:{subscription},
    } = supabase.auth.onAuthStateChange(()=>{
      fetchProfile();
    });


    return ()=>subscription.unsubscribe();


  },[]);



  // ================= UPDATE =================

  const updateField = async (field,value)=>{

    try{


      const {
        data:{user},
      } = await supabase.auth.getUser();



      if(!user) return;



      const updated = {
        ...profile,
        [field]:value,
      };


      setProfile(updated);



      // 🔥 FULLNAME -> AUTH METADATA

      if(field === "full_name"){


        const {error} =
          await supabase.auth.updateUser({

            data:{
              full_name:value,
            }

          });



        if(error){
          console.error(error);
          return;
        }



        sessionStorage.setItem(
          `profile-${user.id}`,
          JSON.stringify(updated)
        );


        console.log(
          "✅ fullname updated in auth"
        );


        return;

      }



      // OTHER FIELDS -> PROFILE TABLE

      const {error} =
        await supabase
        .from("profiles")
        .update({

          [field]:value,

          updated_at:
          new Date().toISOString()

        })
        .eq("id",user.id);



      if(error){
        console.error(error);
      }



      sessionStorage.setItem(
        `profile-${user.id}`,
        JSON.stringify(updated)
      );



    }catch(err){

      console.error(err);

    }

  };



  const toggleEdit=(field)=>{

    setEditing(prev=>({
      ...prev,
      [field]:!prev[field]
    }));

  };



  // ================= IMAGE =================

  const compressImage=(file)=>{

    return new Promise(resolve=>{

      const img=new Image();

      const reader=new FileReader();


      reader.onload=e=>{
        img.src=e.target.result;
      };


      reader.readAsDataURL(file);



      img.onload=()=>{

        const canvas =
        document.createElement("canvas");


        const size=600;


        canvas.width=size;
        canvas.height=size;



        const ctx =
        canvas.getContext("2d");


        ctx.drawImage(
          img,
          0,
          0,
          size,
          size
        );


        canvas.toBlob(blob=>{

          resolve(
            new File(
              [blob],
              file.name,
              {
                type:"image/jpeg"
              }
            )
          );

        },"image/jpeg",0.7);

      };

    });

  };



  const uploadAvatar=async(file)=>{


    try{


      const {
        data:{user},
      }=await supabase.auth.getUser();



      if(!user || !file)return;



      const image =
      await compressImage(file);



      const fileName =
      `${user.id}/${Date.now()}.jpg`;



      const {error} =
      await supabase.storage
      .from("profile-images")
      .upload(
        fileName,
        image,
        {
          upsert:true,
          contentType:"image/jpeg"
        }
      );



      if(error){
        console.error(error);
        return;
      }



      const {data} =
      supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);



      const avatarUrl =
      data.publicUrl;



      await supabase
      .from("profiles")
      .update({

        avatar_url:avatarUrl,

        updated_at:
        new Date().toISOString()

      })
      .eq("id",user.id);



      setProfile(prev=>({

        ...prev,
        avatar_url:avatarUrl

      }));


    }catch(err){

      console.error(err);

    }

  };



  const regenerateUsername=async()=>{

    updateField(
      "username",
      "user_"+nanoid(6)
    );

  };



  if(loading){

    return (
      <div className="min-h-screen bg-white p-6 animate-pulse">

        <div className="h-56 bg-gray-200 rounded-3xl"/>

        <div className="h-24 w-24 bg-gray-300 rounded-full -mt-12 ml-6"/>

      </div>
    );

  }



  if(!profile){

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">

        No profile found

      </div>
    );

  }



  const Field=({label,value,field})=>(

    <div className="py-4 border-b border-gray-200 flex justify-between">


      <div className="w-full">

        <p className="text-xs text-purple-600 uppercase">

          {label}

        </p>



        {editing[field] ? (

          <input

            autoFocus

            defaultValue={value || ""}

            onBlur={(e)=>{

              updateField(
                field,
                e.target.value
              );

              toggleEdit(field);

            }}

            className="
            w-full mt-2
            bg-gray-100
            rounded-xl
            px-3 py-2
            outline-none
            "

          />

        ):(

          <p className="mt-1">

            {value || "Not set"}

          </p>

        )}

      </div>



      <button
      onClick={()=>toggleEdit(field)}
      >

      {editing[field]
      ? <FiCheck/>
      : <FiEdit2/>
      }

      </button>


    </div>

  );




  return (

    <div className="min-h-screen bg-white text-black">


      <div className="max-w-xl mx-auto pb-10">



        <div className="p-4 flex gap-3 items-center border-b">

          <button
          onClick={()=>navigate("/feed")}
          className="bg-gray-100 p-3 rounded-full"
          >

          <FiArrowLeft/>

          </button>


          <div>

          <h1 className="font-bold">
            Profile Settings
          </h1>

          <p className="text-xs text-gray-500">
            @{profile.username}
          </p>


          </div>


        </div>




        <div className="mx-4 mt-4 h-56 rounded-3xl overflow-hidden shadow">


          <img

          src={
            profile.avatar_url ||
            `https://ui-avatars.com/api/?name=${profile.full_name}`
          }

          className="w-full h-full object-cover"

          />


        </div>




        <div className="px-6 -mt-14 relative flex items-end gap-4">


          <div className="relative">


          <img

          src={
          profile.avatar_url ||
          `https://ui-avatars.com/api/?name=${profile.full_name}`
          }

          className="
          w-28 h-28
          rounded-full
          border-4
          border-white
          object-cover
          shadow
          "

          />



          <label className="
          absolute bottom-2 right-2
          bg-purple-600
          text-white
          p-2
          rounded-full
          ">

          <FiCamera/>


          <input

          hidden

          type="file"

          accept="image/*"

          capture="environment"

          onChange={
            e=>uploadAvatar(
              e.target.files[0]
            )
          }

          />


          </label>


          </div>



          <div>

          <h2 className="text-xl font-bold">

          {profile.full_name}

          </h2>


          <div className="flex gap-2 text-purple-600">

          @{profile.username}


          <button onClick={regenerateUsername}>

          <FiRefreshCw size={13}/>

          </button>


          </div>


          </div>


        </div>





        <div className="grid grid-cols-3 gap-3 p-4">

        {["Posts","Followers","Following"].map((x,i)=>(

          <div
          key={x}
          className="
          border
          rounded-2xl
          p-4
          text-center
          "

          >

          <b>
          {[
          profile.posts_count,
          profile.followers_count,
          profile.following_count
          ][i] || 0}
          </b>

          <p className="text-xs text-gray-500">
          {x}
          </p>

          </div>

        ))}


        </div>




        <div className="mx-4 border rounded-3xl p-4">


          <Field
          label="Full Name"
          field="full_name"
          value={profile.full_name}
          />


          <Field label="Website" field="website" value={profile.website}/>

          <Field label="Location" field="location" value={profile.location}/>

          <Field label="School" field="school" value={profile.school}/>

          <Field label="Department" field="department" value={profile.department}/>

          <Field label="Hobby" field="hobby" value={profile.hobby}/>

          <Field label="Relationship" field="relationship_status" value={profile.relationship_status}/>


        </div>


      </div>


    </div>

  );

}