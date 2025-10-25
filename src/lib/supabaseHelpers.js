import { supabase } from './supabase';

// User Sessions
export const UserSession = {
  async filter(query, orderBy = '-created_at') {
    try {
      let supabaseQuery = supabase
        .from('user_sessions')
        .select('*');

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          supabaseQuery = supabaseQuery.eq(key, value);
        });
      }

      if (orderBy) {
        const isDescending = orderBy.startsWith('-');
        const column = isDescending ? orderBy.slice(1) : orderBy;
        supabaseQuery = supabaseQuery.order(column, { ascending: !isDescending });
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering user sessions:', error);
      return [];
    }
  },

  async create(sessionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          ...sessionData,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user session:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user session:', error);
      throw error;
    }
  }
};

// Chat Messages
export const ChatMessage = {
  async filter(query, orderBy = '-created_date') {
    try {
      let supabaseQuery = supabase
        .from('chat_messages')
        .select('*');

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          supabaseQuery = supabaseQuery.eq(key, value);
        });
      }

      if (orderBy) {
        const isDescending = orderBy.startsWith('-');
        const column = isDescending ? orderBy.slice(1) : orderBy;
        supabaseQuery = supabaseQuery.order(column, { ascending: !isDescending });
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering chat messages:', error);
      return [];
    }
  },

  async create(messageData) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }
};

// Projects
export const Project = {
  async filter(query, orderBy = '-created_at') {
    try {
      let supabaseQuery = supabase
        .from('projects')
        .select('*');

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          supabaseQuery = supabaseQuery.eq(key, value);
        });
      }

      if (orderBy) {
        const isDescending = orderBy.startsWith('-');
        const column = isDescending ? orderBy.slice(1) : orderBy;
        supabaseQuery = supabaseQuery.order(column, { ascending: !isDescending });
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering projects:', error);
      return [];
    }
  },

  async create(projectData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};

// Brand Assets
export const BrandAsset = {
  async filter(query, orderBy = '-created_at') {
    try {
      let supabaseQuery = supabase
        .from('brand_assets')
        .select('*');

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          supabaseQuery = supabaseQuery.eq(key, value);
        });
      }

      if (orderBy) {
        const isDescending = orderBy.startsWith('-');
        const column = isDescending ? orderBy.slice(1) : orderBy;
        supabaseQuery = supabaseQuery.order(column, { ascending: !isDescending });
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering brand assets:', error);
      return [];
    }
  },

  async create(assetData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('brand_assets')
        .insert({
          ...assetData,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating brand asset:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('brand_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting brand asset:', error);
      throw error;
    }
  }
};
