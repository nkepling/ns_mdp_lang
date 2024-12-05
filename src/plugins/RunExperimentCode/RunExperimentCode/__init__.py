"""
This is where the implementation of the plugin code goes.
The RunExperimentCode-class is imported from both run_plugin.py and run_debug.py
"""
import sys
import logging
from webgme_bindings import PluginBase
import json

# Setup a logger
logger = logging.getLogger('RunExperimentCode')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class RunExperimentCode(PluginBase):
    def main(self):
        
        core = self.core
        root_node = self.root_node
        active_node = self.active_node
        META = self.META

        name = core.get_attribute(active_node, 'name')

        if not core.is_type_of(active_node, META["Experiment"]):
            logger.error('Active node is not of type Experiment')
            return

        logger.info('ActiveNode at "{0}" has name {1}'.format(core.get_path(active_node), name))

        exp_node_hash = core.get_hash(active_node)

        code = core.get_attribute(active_node, 'code')
        file_content = self.get_file(code)
        logger.debug('Code:\n{0}'.format(file_content))


        exec_context = {}
        try:
            logger.info("Executing the code...")
            exec(file_content, exec_context)
            logger.info("Code executed successfully.")
        except Exception as e:
            logger.error(f"Error executing the code: {e}")
            return

        if "episode_reward" in exec_context:
            episode_reward = exec_context["episode_reward"]
        else:
            logger.error("No 'episode_reward' variable found in the code.")

        if "episode_trace" in exec_context:
            episode_trace = exec_context["episode_trace"]
        else:
            logger.error("No 'episode_trace' variable found in the code.")


        data = {"episode_rewards": episode_reward, "episode_trace": episode_trace}    

        # Save data as a JSON file
        json_file_name = f"{name}_results.json"

        # try:
        #     with open(json_file_name, "w") as json_file:
        #         json.dump(data, json_file, indent=4)
        #     logger.info(f"Results saved as JSON file: {json_file_name}")
        # except Exception as e:
        #     logger.error(f"Error saving JSON file: {e}")

        # Update the model with the file hash (optional if needed in your workflow)
        try:
            file_hash = self.add_file(json_file_name, json.dumps(data))
            core.set_attribute(active_node, 'exp_result', file_hash)
            self.util.save(self.root_node, self.commit_hash, branch_name=self.branch_name, msg='JSON data saved into model')
            logger.info(f"JSON file hash saved in the model.")
        except Exception as e:
            logger.error(f"Error saving file hash to the model: {e}")
        



























