// utils/api.ts

export const fetchUserData = async (username: string) => {
  const response = await fetch(`/api/fetchUserData?username=${username}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw { response: { data } };
  }
  
  return data;
};