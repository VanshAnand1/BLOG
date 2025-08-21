import api from "../http";

export async function fetchPostWithComments(id) {
  const { data } = await api.get(`/posts/${id}`);
  return data;
}
